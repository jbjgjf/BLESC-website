"use client";
import { motion, useReducedMotion } from "framer-motion";
import Flower, { FlowerVariant } from "@/components/ui/Flower";
import styles from "./FloralDivider.module.css";

const SPRAY: Array<{ variant: FlowerVariant; size: number; rotate: number }> = [
  { variant: "pink", size: 22, rotate: -18 },
  { variant: "blue", size: 34, rotate: 8 },
  { variant: "lavender", size: 24, rotate: 26 },
];

/** Small floral spray that blooms in as it scrolls into view. */
export default function FloralDivider() {
  const reducedMotion = useReducedMotion();

  return (
    <div className={styles.divider} aria-hidden="true">
      <span className={styles.line} />
      {SPRAY.map((flower, index) => (
        <motion.span
          key={index}
          className={styles.bud}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.4, rotate: flower.rotate - 30 }}
          whileInView={{ opacity: 1, scale: 1, rotate: flower.rotate }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <Flower variant={flower.variant} size={flower.size} rotate={flower.rotate} />
        </motion.span>
      ))}
      <span className={styles.line} />
    </div>
  );
}
