"use client";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  const textTitle = "Hearing the unspoken.\nPreventing the unseen.";
  const textSubtitle = "生徒のSOSを可視化する。";

  // Typography animation variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.5,
      },
    },
  };

  const charVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
  };

  return (
    <section id="hero" className={styles.hero}>
      {/* Background elements are handled in CSS */}
      <div className={styles.heroInner}>
        <motion.div
          className={styles.heroFlowerWrapper}
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <Image src="/assets/flower.png" alt="blesc flower motif" width={72} height={72} className={styles.heroFlower} />
        </motion.div>

        <motion.h1 className={styles.heroTitle} variants={containerVars} initial="hidden" animate="visible">
          {textTitle.split("\n").map((line, lineIndex) => (
            <div key={lineIndex} style={{ overflow: "hidden", display: "inline-block" }}>
              {line.split("").map((char, index) => (
                <motion.span key={`${lineIndex}-${index}`} variants={charVars} style={{ display: "inline-block", whiteSpace: "pre" }}>
                  {char}
                </motion.span>
              ))}
              {lineIndex === 0 && <br />}
            </div>
          ))}
        </motion.h1>

        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          {textSubtitle}
        </motion.p>

        <motion.div
          className={styles.heroCtas}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          <Link href="#contact" className="btn-outline btn-large">
            資料請求
          </Link>
          <Link href="#contact" className="btn-solid btn-large">
            導入のご相談
          </Link>
        </motion.div>

        <motion.div
          className={styles.heroScrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined">keyboard_double_arrow_down</span>
        </motion.div>
      </div>
    </section>
  );
}
