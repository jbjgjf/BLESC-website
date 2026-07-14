"use client";
import { useRef } from "react";
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Flower, { FlowerVariant } from "@/components/ui/Flower";
import styles from "./FloralScrolly.module.css";

const TITLE = "Hearing the unspoken.\nPreventing the unseen.";
const SUBTITLE = "生徒のSOSを可視化する。";

type FieldFlower = {
  /** Scattered position, percent of stage. */
  scatter: { x: number; y: number };
  /** Angle on the final circle, degrees. */
  angle: number;
  variant: FlowerVariant;
  size: number;
  /** Early parallax speed multiplier. */
  speed: number;
  sprig?: boolean;
  hideOnMobile?: boolean;
};

// Circle the flowers settle into (percent of stage, slightly wider than tall
// so it reads as a circle on typical viewports).
const CIRCLE = { x: 50, y: 46, rx: 16, ry: 24 };

const FIELD: FieldFlower[] = [
  { scatter: { x: 12, y: 16 }, angle: -90, variant: "blue", size: 58, speed: 0.9, sprig: true },
  { scatter: { x: 82, y: 12 }, angle: -30, variant: "lavender", size: 46, speed: 1.3 },
  { scatter: { x: 88, y: 56 }, angle: 30, variant: "blue", size: 62, speed: 0.7, sprig: true },
  { scatter: { x: 74, y: 84 }, angle: 90, variant: "pink", size: 50, speed: 1.1 },
  { scatter: { x: 26, y: 86 }, angle: 150, variant: "blue", size: 44, speed: 1.4, hideOnMobile: true },
  { scatter: { x: 6, y: 58 }, angle: 210, variant: "pink", size: 54, speed: 0.8, sprig: true },
  { scatter: { x: 34, y: 30 }, angle: 270, variant: "lavender", size: 38, speed: 1.6, hideOnMobile: true },
  { scatter: { x: 64, y: 36 }, angle: 330, variant: "blue", size: 40, speed: 1.2, hideOnMobile: true },
];

const PETALS = [
  { left: "8%", size: 13, duration: 16, delay: 0, color: "rgba(120, 168, 220, 0.55)" },
  { left: "28%", size: 9, duration: 21, delay: 6, color: "rgba(236, 164, 178, 0.5)" },
  { left: "52%", size: 11, duration: 18, delay: 11, color: "rgba(120, 168, 220, 0.45)" },
  { left: "72%", size: 8, duration: 23, delay: 3, color: "rgba(175, 151, 221, 0.5)" },
  { left: "88%", size: 12, duration: 19, delay: 9, color: "rgba(236, 164, 178, 0.45)" },
];

function ConvergingFlower({ progress, flower }: { progress: MotionValue<number>; flower: FieldFlower }) {
  const endX = CIRCLE.x + CIRCLE.rx * Math.cos((flower.angle * Math.PI) / 180);
  const endY = CIRCLE.y + CIRCLE.ry * Math.sin((flower.angle * Math.PI) / 180);

  const left = useTransform(progress, [0.52, 0.82], [`${flower.scatter.x}%`, `${endX}%`]);
  const top = useTransform(progress, [0.52, 0.82], [`${flower.scatter.y}%`, `${endY}%`]);
  // Early parallax drift that returns home before convergence begins.
  const y = useTransform(progress, [0, 0.5, 0.82], [0, -110 * flower.speed, 0]);
  const rotate = useTransform(progress, [0.52, 0.82], [flower.angle * 0.4, flower.angle + 90]);
  const scale = useTransform(progress, [0.52, 0.82], [1, 0.82]);

  return (
    <motion.div
      className={`${styles.fieldFlower} ${flower.hideOnMobile ? styles.hideOnMobile : ""}`}
      style={{ left, top, y, rotate, scale, x: "-50%", translateY: "-50%" }}
    >
      <div className={styles.sway}>
        <Flower variant={flower.variant} size={flower.size} sprig={flower.sprig} />
      </div>
    </motion.div>
  );
}

function HeroCard({ interactive }: { interactive?: boolean }) {
  return (
    <div className={styles.paperCard} style={{ rotate: "-1.2deg", pointerEvents: interactive ? "auto" : undefined }}>
      <div className={styles.cornerFlower} style={{ top: -26, left: -20 }}>
        <Flower variant="blue" size={52} rotate={18} />
      </div>
      <div className={styles.cornerFlower} style={{ bottom: -22, right: -16 }}>
        <Flower variant="pink" size={44} rotate={-24} />
      </div>
      <h1 className={styles.title}>{TITLE}</h1>
      <p className={styles.subtitle}>{SUBTITLE}</p>
      <div className={styles.ctas}>
        <Link href="#contact" className="btn-outline btn-large">資料請求</Link>
        <Link href="#contact" className="btn-solid btn-large">導入のご相談</Link>
      </div>
    </div>
  );
}

export default function FloralScrolly() {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Scene 1 — hero paper card settles, then drifts away.
  const card1Opacity = useTransform(scrollYProgress, [0, 0.24, 0.38], [1, 1, 0]);
  const card1Y = useTransform(scrollYProgress, [0, 0.38], [0, -140]);
  const card1Rotate = useTransform(scrollYProgress, [0, 0.38], [0, -4]);

  // Scene 2 — tilted second sheet passes through.
  const card2Opacity = useTransform(scrollYProgress, [0.3, 0.42, 0.56, 0.66], [0, 1, 1, 0]);
  const card2Y = useTransform(scrollYProgress, [0.3, 0.66], [120, -120]);

  // Scene 3 — halo brightens, flowers converge, finale message blooms.
  const haloOpacity = useTransform(scrollYProgress, [0, 0.55, 0.85], [0.25, 0.35, 1]);
  const haloScale = useTransform(scrollYProgress, [0.5, 0.9], [0.72, 1]);
  const ringOpacity = useTransform(scrollYProgress, [0.62, 0.85], [0, 1]);
  const finaleOpacity = useTransform(scrollYProgress, [0.66, 0.82], [0, 1]);
  const finaleScale = useTransform(scrollYProgress, [0.66, 0.88], [0.94, 1]);
  const finaleInteractive = useTransform(scrollYProgress, (value) => (value > 0.72 ? "auto" : "none"));
  const card1Interactive = useTransform(scrollYProgress, (value) => (value < 0.28 ? "auto" : "none"));

  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  if (reducedMotion) {
    // Static composition: scene 1 without parallax or looping animation.
    return (
      <section id="hero" className={styles.staticHero}>
        <div className={styles.halo} style={{ opacity: 0.5 }} />
        <HeroCard interactive />
      </section>
    );
  }

  return (
    <section id="hero" ref={containerRef} className={styles.scrolly}>
      <div className={styles.stage}>
        <motion.div className={styles.halo} style={{ opacity: haloOpacity, scale: haloScale }} />
        <motion.div className={styles.haloRing} style={{ opacity: ringOpacity }} />

        <div className={styles.flowerField}>
          {FIELD.map((flower) => (
            <ConvergingFlower key={flower.angle} progress={scrollYProgress} flower={flower} />
          ))}
        </div>

        {PETALS.map((petal) => (
          <span
            key={petal.left}
            className={`${styles.petal} ${styles.hideOnMobile}`}
            style={{
              left: petal.left,
              width: petal.size,
              height: petal.size * 1.35,
              background: petal.color,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
            }}
          />
        ))}

        <motion.div
          className={styles.cardLayer}
          style={{ opacity: card1Opacity, y: card1Y, rotate: card1Rotate, pointerEvents: card1Interactive }}
        >
          <HeroCard interactive />
        </motion.div>

        <motion.div className={styles.cardLayer} style={{ opacity: card2Opacity, y: card2Y }}>
          <div className={styles.paperCard} style={{ rotate: "2.4deg" }}>
            <div className={styles.cornerFlower} style={{ top: -24, right: -18 }}>
              <Flower variant="lavender" size={46} rotate={40} />
            </div>
            <p className={styles.midMessage}>日常の会話に、<br />小さなサインは咲いている。</p>
            <p className={styles.midBody}>
              見過ごされてきた声のかけらを、AIが静かにすくいあげます。
              会話の内容は教員に共有されず、支援の判断材料だけが届きます。
            </p>
          </div>
        </motion.div>

        <motion.div
          className={styles.finale}
          style={{ opacity: finaleOpacity, scale: finaleScale, pointerEvents: finaleInteractive }}
        >
          <p className={styles.finaleMessage}>
            ひとつずつは、小さなサイン。<br />
            集まれば、支援へのみちしるべになる。
          </p>
          <div className={styles.ctas}>
            <Link href="#reality" className="btn-outline">現状の課題を見る</Link>
            <Link href="#contact" className="btn-solid">導入のご相談</Link>
          </div>
        </motion.div>

        <motion.div className={styles.scrollHint} style={{ opacity: hintOpacity }} aria-hidden="true">
          <span>scroll</span>
          <span className="material-symbols-outlined">keyboard_double_arrow_down</span>
        </motion.div>
      </div>
    </section>
  );
}
