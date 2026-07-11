"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./Technology.module.css";

export default function Technology() {
  const containerRef = useRef(null);
  
  // Track scroll progress within this section to draw the SVG line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // The line draws from 0 to 1 as we scroll through the section
  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  
  return (
    <section id="technology" className={styles.technology} ref={containerRef}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          テクノロジー
        </motion.h2>
        
        <div className={styles.techIntro}>
          <motion.p 
            className="text-lead"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            blescは、言葉を予測するだけの汎用AIではありません。
          </motion.p>
          <motion.p 
            className="text-body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            「睡眠不足 → 認知機能の低下 → 抑うつ傾向」といった心理の因果連鎖を、医学的研究にもとづいて構造化した<strong>オントロジー知識グラフ</strong>をAIに実装しています。これは、臨床心理士の思考プロセスを機械可読な形で再現する仕組みです。
          </motion.p>
          <motion.p 
            className="text-body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            このモデルは<strong>京都大学の臨床心理学研究</strong>との協働によって開発しています。プラットフォーム基盤は、学校環境の要件に耐えうるスケーラブルな設計を、<strong>株式会社Hatapro</strong>との連携で構築しています。
          </motion.p>
        </div>

        <div className={styles.ontologyDiagramWrapper}>
          <h3 className={styles.diagramTitle}>臨床心理学オントロジー知識グラフの概念モデル</h3>
          
          <div className={styles.ontologyFlowContainer}>
            {/* SVG Background Line */}
            <svg className={styles.svgLine} viewBox="0 0 800 100" preserveAspectRatio="none">
              <motion.path
                d="M 50 50 L 750 50"
                fill="transparent"
                strokeWidth="4"
                stroke="var(--accent)"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>

            <div className={styles.ontologyFlow}>
              <motion.div 
                className={styles.ontologyNode}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <span className="material-symbols-outlined">bedtime</span>
                <span className={styles.nodeLabel}>睡眠不足</span>
              </motion.div>
              
              <div className={styles.ontologyArrowSpacer}>
                <span className={styles.arrowLabel}>認知の低下</span>
              </div>
              
              <motion.div 
                className={styles.ontologyNode}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.3 }}
              >
                <span className="material-symbols-outlined">psychology</span>
                <span className={styles.nodeLabel}>認知機能の低下</span>
              </motion.div>
              
              <div className={styles.ontologyArrowSpacer}>
                <span className={styles.arrowLabel}>リスク顕在化</span>
              </div>
              
              <motion.div 
                className={`${styles.ontologyNode} ${styles.nodeDepress}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.6 }}
              >
                <span className="material-symbols-outlined">mood_bad</span>
                <span className={styles.nodeLabel}>抑うつ傾向</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
