"use client";

import * as React from "react";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "@/components/webgl/WebGLErrorBoundary";

const VERTEX_SHADER = `
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_speed;
uniform float u_intensity;
uniform float u_grain;
uniform float u_vignette;
uniform float u_mouseInfluence;
uniform vec3 u_base;
uniform vec3 u_mid;
uniform vec3 u_sheen;
uniform vec3 u_accent;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.93, 289.17))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.82, 0.57, -0.57, 0.82);

  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p = rot * p * 2.03;
    amp *= 0.5;
  }

  return value;
}

float ribbon(vec2 p, float offset, float width, float softness) {
  float y = p.y + sin(p.x * 1.8 + offset) * 0.18;
  y += sin(p.x * 4.2 - offset * 0.7) * 0.045;
  return smoothstep(width + softness, width, abs(y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 mouse = (u_mouse - 0.5) * vec2(aspect, 1.0);
  float t = u_time * 0.12 * u_speed;
  float pointerFalloff = smoothstep(0.72, 0.0, length(p - mouse));
  p += (mouse - p) * pointerFalloff * 0.05 * u_mouseInfluence;

  vec2 silk = p;
  silk.x += fbm(p * 1.6 + vec2(t * 0.8, -t * 0.35)) * 0.16;
  silk.y += fbm(p * 2.2 + vec2(-t * 0.25, t * 0.7)) * 0.10;

  float veilA = ribbon(silk + vec2(-0.18, 0.08), t * 2.1, 0.055, 0.22);
  float veilB = ribbon(silk * vec2(0.86, 1.18) + vec2(0.2, -0.14), -t * 2.8 + 1.7, 0.038, 0.18);
  float veilC = ribbon(silk * vec2(1.18, 0.9) + vec2(-0.08, 0.24), t * 1.4 - 2.1, 0.03, 0.16);

  float atmosphere = fbm(p * 1.35 + vec2(t * 0.22, -t * 0.1));
  float pearlescent = pow(max(0.0, sin((p.x - p.y) * 7.5 + atmosphere * 4.0 - t * 2.5)), 5.0);
  float glint = pow(max(0.0, noise(gl_FragCoord.xy * 0.065 + t * 18.0) - 0.72), 5.0);

  vec3 col = u_base;
  col = mix(col, u_mid, smoothstep(-0.45, 0.75, p.y + atmosphere * 0.75));
  col += u_accent * veilA * 0.72 * u_intensity;
  col += u_sheen * veilB * 0.64 * u_intensity;
  col += mix(u_sheen, u_accent, 0.35) * veilC * 0.42 * u_intensity;
  col += u_sheen * pearlescent * 0.075 * u_intensity;
  col += vec3(1.0, 0.93, 0.82) * glint * 0.22 * u_intensity;
  col += u_sheen * pointerFalloff * 0.08 * u_mouseInfluence;

  float vignette = smoothstep(1.25, 0.22, length(p));
  col *= mix(1.0 - u_vignette * 0.42, 1.06, vignette);

  float grain = (hash(gl_FragCoord.xy + t * 90.0) - 0.5) * 0.08 * u_grain;
  col += grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

/* Site palette, not the component's shipped teal/cream. */
const DEFAULT_BASE = "#0a0b0d"; // --color-bg
const DEFAULT_MID = "#121417"; // --color-bg-alt
const DEFAULT_SHEEN = "#ffffff"; // --color-text, so highlights read as light
const DEFAULT_ACCENT = "#85c0ed"; // --color-primary

function sanitizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!HEX_COLOR_REGEX.test(trimmed)) return fallback;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function hexToRgb01(hex: string, fallback: string): [number, number, number] {
  const normalized = sanitizeHexColor(hex, fallback).replace("#", "");
  return [
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

export interface SilkAuroraProps {
  className?: string;
  baseColor?: string;
  midColor?: string;
  sheenColor?: string;
  accentColor?: string;
  speed?: number;
  intensity?: number;
  grain?: number;
  vignette?: number;
  mouseInfluence?: number;
  /** Cursor-driven parallax. Off by default. */
  interactive?: boolean;
}

/**
 * Decorative WebGL aurora, used purely as a background layer.
 *
 * The upstream component also rendered a title/subtitle/description and its
 * own <h1>. Those props are removed rather than merely left unset: the page
 * already has an <h1> in the hero, and a second one would be an SEO and
 * screen-reader problem waiting for someone to pass `title` by accident.
 */
export function SilkAurora({
  className = "",
  baseColor = DEFAULT_BASE,
  midColor = DEFAULT_MID,
  sheenColor = DEFAULT_SHEEN,
  accentColor = DEFAULT_ACCENT,
  speed = 0.5,
  intensity = 1,
  grain = 0.6,
  vignette = 1,
  mouseInfluence = 1,
  interactive = false,
}: SilkAuroraProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mouseRef = React.useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = React.useRef({ x: 0.5, y: 0.5 });

  const settings = React.useMemo(
    () => ({
      baseColor,
      midColor,
      sheenColor,
      accentColor,
      speed,
      intensity,
      grain,
      vignette,
      mouseInfluence,
      interactive,
    }),
    [
      baseColor,
      midColor,
      sheenColor,
      accentColor,
      speed,
      intensity,
      grain,
      vignette,
      mouseInfluence,
      interactive,
    ],
  );

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Everything registered here is torn down on one path, so the early
    // bail-outs below cannot leak listeners the way the original did.
    const cleanups: Array<() => void> = [];
    const runCleanups = () => {
      for (const fn of cleanups.splice(0).reverse()) fn();
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);
    cleanups.push(() => motionQuery.removeEventListener("change", onMotionChange));

    if (settings.interactive) {
      const handlePointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        targetMouseRef.current = {
          x: (event.clientX - rect.left) / rect.width,
          y: 1 - (event.clientY - rect.top) / rect.height,
        };
      };
      const handlePointerLeave = () => {
        targetMouseRef.current = { x: 0.5, y: 0.5 };
      };

      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);
      cleanups.push(() => {
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
      });
    }

    try {
      const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
      // No context: the static gradient underneath simply stays visible.
      if (!gl) return runCleanups;

      const compileShader = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error("SilkAurora shader:", gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (vertexShader) cleanups.push(() => gl.deleteShader(vertexShader));
      if (fragmentShader) cleanups.push(() => gl.deleteShader(fragmentShader));
      if (!vertexShader || !fragmentShader) return runCleanups;

      const program = gl.createProgram();
      if (!program) return runCleanups;
      cleanups.push(() => gl.deleteProgram(program));

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("SilkAurora link:", gl.getProgramInfoLog(program));
        return runCleanups;
      }

      gl.useProgram(program);

      const position = gl.getAttribLocation(program, "position");
      const buffer = gl.createBuffer();
      cleanups.push(() => gl.deleteBuffer(buffer));
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      // A null location is a no-op for gl.uniform*, so unlike the original
      // there is no need to tear the whole thing down over one of them.
      const u = (name: string) => gl.getUniformLocation(program, name);
      const uRes = u("u_res");
      const uMouse = u("u_mouse");
      const uTime = u("u_time");
      const uSpeed = u("u_speed");
      const uIntensity = u("u_intensity");
      const uGrain = u("u_grain");
      const uVignette = u("u_vignette");
      const uMouseInfluence = u("u_mouseInfluence");

      const base = hexToRgb01(settings.baseColor, DEFAULT_BASE);
      const mid = hexToRgb01(settings.midColor, DEFAULT_MID);
      const sheen = hexToRgb01(settings.sheenColor, DEFAULT_SHEEN);
      const accent = hexToRgb01(settings.accentColor, DEFAULT_ACCENT);

      gl.uniform3f(u("u_base"), base[0], base[1], base[2]);
      gl.uniform3f(u("u_mid"), mid[0], mid[1], mid[2]);
      gl.uniform3f(u("u_sheen"), sheen[0], sheen[1], sheen[2]);
      gl.uniform3f(u("u_accent"), accent[0], accent[1], accent[2]);

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { width, height } = container.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      };

      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      cleanups.push(() => resizeObserver.disconnect());

      let rafId = 0;
      const start = performance.now();

      const render = (now: number) => {
        mouseRef.current.x +=
          (targetMouseRef.current.x - mouseRef.current.x) * 0.045;
        mouseRef.current.y +=
          (targetMouseRef.current.y - mouseRef.current.y) * 0.045;

        // Reduced motion freezes time at a fixed, pleasant point in the loop.
        const elapsed = reducedMotion ? 8 : (now - start) / 1000;

        gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uSpeed, reducedMotion ? 0 : settings.speed);
        gl.uniform1f(uIntensity, settings.intensity);
        gl.uniform1f(uGrain, settings.grain);
        gl.uniform1f(uVignette, settings.vignette);
        gl.uniform1f(
          uMouseInfluence,
          settings.interactive && !reducedMotion ? settings.mouseInfluence : 0,
        );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        rafId = requestAnimationFrame(render);
      };

      /*
       * The upstream component renders forever. This one only draws while the
       * hero is actually on screen — a full-viewport 5-octave fbm running
       * behind content the visitor scrolled past is pure battery cost. One
       * frame is drawn on the way out so the canvas is never left blank.
       */
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(render);
          } else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        },
        { threshold: 0 },
      );
      observer.observe(container);
      cleanups.push(() => {
        observer.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
      });

      return runCleanups;
    } catch (error) {
      console.error("SilkAurora: initialisation failed.", error);
      runCleanups();
      return undefined;
    }
  }, [settings]);

  const layerClass = `pointer-events-none absolute inset-0 overflow-hidden ${className}`;

  return (
    <WebGLErrorBoundary
      fallback={<WebGLFallback className={`${layerClass} h-full w-full`} />}
    >
      <div ref={containerRef} aria-hidden className={layerClass}>
        {/* Sits underneath permanently; visible only if the canvas never draws. */}
        <WebGLFallback className="absolute inset-0 h-full w-full" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(255,255,255,0.10),transparent_26%),radial-gradient(circle_at_18%_74%,rgba(133,192,237,0.12),transparent_32%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0b0d] to-transparent" />
      </div>
    </WebGLErrorBoundary>
  );
}

export default SilkAurora;
