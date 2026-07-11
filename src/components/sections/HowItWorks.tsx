"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./HowItWorks.module.css";

export default function HowItWorks() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Depending on scroll progress, we highlight different steps
  const step1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0.3]);
  const step2Opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.5, 0.6], [0.3, 1, 1, 0.3]);
  const step3Opacity = useTransform(scrollYProgress, [0.5, 0.7, 1], [0.3, 1, 1]);

  return (
    <section id="how-it-works" className={styles.howItWorks} ref={containerRef}>
      <div className={styles.stickyContainer}>
        <div className="section-container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            blescの仕組み
          </motion.h2>
          
          <div className={styles.contentGrid}>
            {/* Left side: Flowchart (Sticky) */}
            <div className={styles.pipelineContainer}>
              <div className={styles.pipelineLine}>
                <div className={styles.pipelineFlowDot}></div>
              </div>
              
              <div className={styles.pipelineSteps}>
                <motion.div className={styles.pipelineStep} style={{ opacity: step1Opacity }}>
                  <div className={styles.pipelineNode}>
                    <span className="material-symbols-outlined">face</span>
                  </div>
                  <span className={styles.pipelineLabel}>生徒</span>
                  <div className={styles.pipelineConnectorText}>30往復の対話</div>
                </motion.div>
                
                <motion.div className={styles.pipelineStep} style={{ opacity: step2Opacity }}>
                  <div className={styles.pipelineNode}>
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <span className={styles.pipelineLabel}>AI解析</span>
                  <span className={styles.pipelineSublabel}>生のログは非公開</span>
                  <div className={styles.pipelineConnectorText}>リスクレポート</div>
                </motion.div>
                
                <motion.div className={styles.pipelineStep} style={{ opacity: step3Opacity }}>
                  <div className={styles.pipelineNode}>
                    <span className="material-symbols-outlined">supervisor_account</span>
                  </div>
                  <span className={styles.pipelineLabel}>教員</span>
                </motion.div>
              </div>
            </div>

            {/* Right side: Explanations (scrolling) */}
            <div className={styles.howTextBlock}>
              <motion.div className={styles.textSection} style={{ opacity: step1Opacity }}>
                <h3 className={styles.stepTitle}>01. 自然な対話</h3>
                <p className="text-body">
                  月に一度、ホームルームの時間に、生徒は<strong>AIと30往復ほどの自然な対話</strong>を行います。チャットのように、構えずに話せる設計です。
                </p>
              </motion.div>

              <motion.div className={styles.textSection} style={{ opacity: step2Opacity }}>
                <h3 className={styles.stepTitle}>02. 独自のAI解析</h3>
                <p className="text-body">
                  会話に含まれる言葉のニュアンスや入力のためらいといった微細なシグナルから、<strong>AIが心理的リスクを検知</strong>します。
                </p>
              </motion.div>

              <motion.div className={styles.textSection} style={{ opacity: step3Opacity }}>
                <h3 className={styles.stepTitle}>03. リスクの可視化</h3>
                <p className="text-body">
                  会話の内容そのものが教員に公開されることはありません。届くのは、対応が必要な生徒を示す<strong>要点のみのレポート</strong>です。
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
