"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Reality.module.css";

// A small component to animate counting up when in view
function CountUp({ target, duration = 1.2, suffix = "", prefix = "" }: { target: number, duration?: number, suffix?: string, prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="count-up">
      {prefix}{count.toLocaleString("en-US")}{suffix}
    </span>
  );
}

export default function Reality() {
  const containerRef = useRef(null);
  
  // Parallax effect for the background text or decorative elements
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="reality" className={styles.reality} ref={containerRef}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          学校が直面している現実
        </motion.h2>

        <motion.div 
          className={styles.realityHighlight}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-lead">
            危機が起きてからでは、遅い。<br />
            生徒の不調に気づくのが<strong>「何かが起きた後」</strong>になってしまう。Blescは、そのタイミングを根本から変えます。
          </p>
          <p className="text-lead">
            日常の会話に現れる早期のサインをAIが捉え、支援が必要な生徒を、<strong>孤立する前に可視化</strong>します。
          </p>
        </motion.div>

        <div className={styles.realityStatsGrid}>
          <motion.div 
            className={styles.statItem}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className={styles.statNumber}>
              <CountUp target={1} suffix="st" /> / <CountUp target={37} suffix="th" />
            </span>
            <p className={styles.statText}>
              日本の子どもは、身体的健康で<strong>世界1位</strong>である一方、精神的幸福度は38カ国中<strong>37位</strong>にとどまっています。
            </p>
          </motion.div>
          <motion.div 
            className={styles.statItem}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className={styles.statNumber}>
              <CountUp target={350000} suffix="+" />
            </span>
            <p className={styles.statText}>
              不登校の児童・生徒は<strong>35万人を超え</strong>、現在も増加を続けています。
            </p>
          </motion.div>
        </div>

        <div className={styles.limitsDivider}></div>

        <motion.h3 
          className={styles.subsectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          既存の仕組みには、構造的な限界があります。
        </motion.h3>

        <div className={styles.limitsGrid}>
          {[
            {
              title: "アンケートでは本音が表れない。",
              desc: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。"
            },
            {
              title: "深刻なケースほど見えなくなる。",
              desc: "追い詰められた生徒ほど周囲を拒み、孤立します。SOSを待つ仕組みでは間に合いません。"
            },
            {
              title: "教員のリソースには限界がある。",
              desc: "40名を一人ひとり見守り、心の機微まで捉えることは現実的ではありません。"
            }
          ].map((limit, i) => (
            <motion.div 
              key={i} 
              className={styles.limitItem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8, borderColor: "var(--accent-border)" }}
            >
              <h4 className={styles.limitTitle}>{limit.title}</h4>
              <p className={styles.limitDesc}>
                {limit.desc.split("大人が望む無難な回答").length > 1 
                  ? <>「はい／いいえ」形式では、生徒は<strong>大人が望む無難な回答</strong>を選びます。</>
                  : limit.desc.split("SOSを待つ仕組みでは間に合いません").length > 1
                  ? <>追い詰められた生徒ほど周囲を拒み、孤立します。<strong>SOSを待つ仕組みでは間に合いません。</strong></>
                  : limit.desc.split("心の機微まで捉えることは現実的ではありません").length > 1
                  ? <>40名を一人ひとり見守り、<strong>心の機微まで捉えることは現実的ではありません。</strong></>
                  : limit.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
