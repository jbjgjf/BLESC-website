"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./IntroOverlay.module.css";

export default function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has reduced motion or already saw intro
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let introSeen = false;
    try {
      introSeen = sessionStorage.getItem("blesc-intro-seen") === "1";
    } catch (e) {}

    if (prefersReducedMotion || introSeen) {
      setIsVisible(false);
      document.body.classList.remove("is-locked");
    } else {
      document.body.classList.add("is-locked");
      try {
        sessionStorage.setItem("blesc-intro-seen", "1");
      } catch (e) {}
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence onExitComplete={() => document.body.classList.remove("is-locked")}>
      {isVisible && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          <motion.div
            className={styles.whiteCurtain}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.8, ease: [0.76, 0, 0.1, 1] }}
          />

          <div className={styles.flowerContainer}>
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 45, rotate: 90 }}
              transition={{ delay: 0.05, duration: 1.3, ease: [0.76, 0, 0.1, 1] }}
              className={styles.flowerWrapper}
            >
              <Image
                src="/assets/flower.png"
                alt="blesc flower logo"
                width={160}
                height={160}
                className={styles.flower}
                priority
              />
            </motion.div>
          </div>

          <motion.div
            className={styles.logoContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              times: [0, 0.2, 0.8, 1],
              duration: 2.0,
              delay: 1.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => setIsVisible(false)}
          >
            <Image
              src="/assets/logo_with_flower.png"
              alt="blesc logo"
              width={320}
              height={100}
              className={styles.wordmark}
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
