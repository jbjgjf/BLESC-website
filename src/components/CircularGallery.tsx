"use client";

import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import { useEffect, useRef } from "react";

export interface GalleryItem {
  image: string;
  text: string;
}

export interface CircularGalleryProps {
  items: GalleryItem[];
  /** Curvature of the arc. Higher bends harder. */
  bend?: number;
  /** Corner rounding as a fraction of the plane, 0–0.5. */
  borderRadius?: number;
  scrollSpeed?: number;
  /** Lower is smoother. */
  scrollEase?: number;
  className?: string;
  /** Fires with the roster index sitting closest to centre. */
  onActiveChange?: (index: number) => void;
  /**
   * Hands back a stepper once the scene exists. A drag-only WebGL canvas is
   * completely inoperable by keyboard, so the section above it wires this to
   * real buttons.
   */
  onReady?: (api: { step: (delta: number) => void }) => void;
}

type Scroll = {
  ease: number;
  current: number;
  target: number;
  last: number;
  position: number;
};

type Size = { width: number; height: number };

type FontSpec = { family: string; weight: string; size: number; color: string };

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

/**
 * Rasterises a single line of text.
 *
 * The original derived the line height with `parseInt(font, 10)` against a
 * full CSS font shorthand — which reads the *weight*, so a "500 30px Inter"
 * spec produced a 600px-tall canvas holding 30px type, and the resulting
 * aspect ratio squashed every title. Size is passed explicitly instead, and
 * the bitmap is drawn at DPR so Japanese glyphs stay sharp.
 */
function createTextTexture(
  gl: OGLRenderingContext,
  text: string,
  { family, weight, size, color }: FontSpec,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  const font = `${weight} ${size}px ${family}`;
  context.font = font;

  const width = Math.ceil(context.measureText(text).width) + 24;
  const height = Math.ceil(size * 1.5);

  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);

  context.scale(dpr, dpr);
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, width, height);
  context.fillText(text, width / 2, height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width, height };
}

/* -------------------------------------------------------------------------- */
/* Title                                                                      */
/* -------------------------------------------------------------------------- */

class Title {
  mesh!: Mesh;

  constructor(
    private gl: OGLRenderingContext,
    private plane: Mesh,
    text: string,
    font: FontSpec,
  ) {
    const { texture, width, height } = createTextTexture(gl, text, font);

    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });

    this.mesh = new Mesh(gl, { geometry: new Plane(gl), program });

    const textHeight = this.plane.scale.y * 0.12;
    this.mesh.scale.set(textHeight * (width / height), textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.08;
    this.mesh.setParent(this.plane);
  }
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

class Media {
  program!: Program;
  plane!: Mesh;
  extra = 0;
  widthTotal = 0;
  width = 0;
  x = 0;
  scale = 1;
  padding = 2;
  speed = 0;

  constructor(
    private gl: OGLRenderingContext,
    private geometry: Plane,
    private scene: Transform,
    private image: string,
    public index: number,
    private length: number,
    private screen: Size,
    private viewport: Size,
    private bend: number,
    private borderRadius: number,
    private wobble: boolean,
    text: string,
    font: FontSpec,
  ) {
    this.createShader();
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
    new Title(this.gl, this.plane, text, font);
    this.onResize();
  }

  private createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uWobble;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5)
                * (0.1 + uSpeed * 0.5) * uWobble;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
        uWobble: { value: this.wobble ? 1 : 0 },
      },
      transparent: true,
    });

    const img = new Image();
    // crossOrigin on a data: URI is pointless and upsets some engines.
    if (!this.image.startsWith("data:")) img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };
  }

  update(scroll: Scroll, direction: "left" | "right") {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B = Math.abs(this.bend);
      const R = (H * H + B * B) / (2 * B);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);

      this.plane.position.y = this.bend > 0 ? -arc : arc;
      this.plane.rotation.z =
        (this.bend > 0 ? -1 : 1) * Math.sign(x) * Math.asin(effectiveX / R);
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    const isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    const isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === "right" && isBefore) this.extra -= this.widthTotal;
    if (direction === "left" && isAfter) this.extra += this.widthTotal;
  }

  onResize(sizes: { screen?: Size; viewport?: Size } = {}) {
    if (sizes.screen) this.screen = sizes.screen;
    if (sizes.viewport) this.viewport = sizes.viewport;

    this.scale = this.screen.height / 1500;
    this.plane.scale.y =
      (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x =
      (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

/* -------------------------------------------------------------------------- */
/* App                                                                        */
/* -------------------------------------------------------------------------- */

class App {
  private renderer!: Renderer;
  private gl!: OGLRenderingContext;
  private camera!: Camera;
  private scene!: Transform;
  private planeGeometry!: Plane;
  private medias: Media[] = [];
  private screen!: Size;
  private viewport!: Size;
  private raf = 0;
  private isDown = false;
  private start = 0;
  private lastActive = -1;
  private observer?: IntersectionObserver;

  scroll: Scroll;

  constructor(
    private container: HTMLElement,
    private opts: {
      items: GalleryItem[];
      bend: number;
      borderRadius: number;
      scrollSpeed: number;
      scrollEase: number;
      wobble: boolean;
      font: FontSpec;
      onActiveChange?: (index: number) => void;
    },
  ) {
    this.scroll = {
      ease: opts.scrollEase,
      current: 0,
      target: 0,
      last: 0,
      position: 0,
    };

    this.onResize = this.onResize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
    this.update = this.update.bind(this);

    this.createRenderer();
    this.createCamera();
    this.scene = new Transform();
    this.onResize();
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
    this.createMedias();
    this.addEventListeners();
    this.raf = requestAnimationFrame(this.update);
  }

  /** Roster length before the seamless-loop duplication. */
  private get realLength() {
    return this.opts.items.length;
  }

  private createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  private createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  private createMedias() {
    // Duplicated so the ring can wrap without a visible seam.
    const doubled = [...this.opts.items, ...this.opts.items];

    this.medias = doubled.map(
      (data, index) =>
        new Media(
          this.gl,
          this.planeGeometry,
          this.scene,
          data.image,
          index,
          doubled.length,
          this.screen,
          this.viewport,
          this.opts.bend,
          this.opts.borderRadius,
          this.opts.wobble,
          data.text,
          this.opts.font,
        ),
    );
  }

  private onDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  private onMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.opts.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }

  private onUp() {
    if (!this.isDown) return;
    this.isDown = false;
    this.snap();
  }

  /*
   * Horizontal intent only, and bound to the container rather than window.
   *
   * The original registered `wheel` on window, so every scroll anywhere on
   * the page also spun the gallery — on a single-page site driven by Lenis
   * that fights the page scroll from top to bottom. Vertical wheel now falls
   * through to the page untouched; trackpad swipes and shift+wheel drive the
   * carousel.
   */
  private onWheel(e: WheelEvent) {
    const horizontal = e.shiftKey ? e.deltaY : e.deltaX;
    if (Math.abs(horizontal) < Math.abs(e.deltaY) && !e.shiftKey) return;
    if (horizontal === 0) return;

    e.preventDefault();
    this.scroll.target += horizontal * this.opts.scrollSpeed * 0.05;
    this.snap();
  }

  /** Step the carousel by whole cards — used by the keyboard controls. */
  step(delta: number) {
    if (!this.medias.length) return;
    const width = this.medias[0].width;
    this.scroll.target = Math.round(this.scroll.target / width) * width + delta * width;
  }

  private snap() {
    if (!this.medias.length) return;
    const width = this.medias[0].width;
    this.scroll.target = Math.round(this.scroll.target / width) * width;
  }

  private onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };

    this.medias.forEach((m) =>
      m.onResize({ screen: this.screen, viewport: this.viewport }),
    );
  }

  private update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;

    if (this.medias.length) {
      const width = this.medias[0].width;
      const raw = Math.round(this.scroll.current / width);
      const active = ((raw % this.realLength) + this.realLength) % this.realLength;
      if (active !== this.lastActive) {
        this.lastActive = active;
        this.opts.onActiveChange?.(active);
      }
    }

    this.raf = requestAnimationFrame(this.update);
  }

  private addEventListeners() {
    window.addEventListener("resize", this.onResize);
    this.container.addEventListener("wheel", this.onWheel, { passive: false });
    this.container.addEventListener("mousedown", this.onDown);
    this.container.addEventListener("touchstart", this.onDown, {
      passive: true,
    });
    // Drag continues outside the element, so these stay on window.
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mouseup", this.onUp);
    window.addEventListener("touchmove", this.onMove, { passive: true });
    window.addEventListener("touchend", this.onUp);

    // A GPU loop for a carousel nobody is looking at is pure battery cost.
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.raf) {
          this.raf = requestAnimationFrame(this.update);
        } else if (!entry.isIntersecting && this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
        }
      },
      { threshold: 0 },
    );
    this.observer.observe(this.container);
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    window.removeEventListener("resize", this.onResize);
    this.container.removeEventListener("wheel", this.onWheel);
    this.container.removeEventListener("mousedown", this.onDown);
    this.container.removeEventListener("touchstart", this.onDown);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseup", this.onUp);
    window.removeEventListener("touchmove", this.onMove);
    window.removeEventListener("touchend", this.onUp);

    const canvas = this.renderer?.gl?.canvas;
    canvas?.parentNode?.removeChild(canvas);
  }
}

/* -------------------------------------------------------------------------- */
/* React                                                                      */
/* -------------------------------------------------------------------------- */

export function CircularGallery({
  items,
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
  className = "",
  onActiveChange,
  onReady,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Callbacks are read through refs so a new function identity never tears
  // down and rebuilds the whole WebGL scene. Declared first so this effect
  // runs before the one below on mount, and the refs are already populated.
  const activeRef = useRef(onActiveChange);
  const readyRef = useRef(onReady);
  useEffect(() => {
    activeRef.current = onActiveChange;
    readyRef.current = onReady;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = getComputedStyle(container);
    const wobble = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    const app = new App(container, {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      wobble,
      font: {
        family: style.fontFamily,
        weight: "500",
        size: 30,
        color: style.color,
      },
      onActiveChange: (i) => activeRef.current?.(i),
    });

    readyRef.current?.({ step: (delta) => app.step(delta) });

    return () => app.destroy();
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  return (
    <div
      ref={containerRef}
      // Everything inside is pixels, never text — the roster lives in the DOM
      // alongside this, so assistive tech is pointed there instead.
      aria-hidden
      className={`h-full w-full cursor-grab overflow-hidden text-ink active:cursor-grabbing ${className}`}
    />
  );
}
