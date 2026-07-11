"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./Product.module.css";

// Typing animation component
const TypingIndicator = () => (
  <div className={`${styles.bubble} ${styles.bubbleTyping}`}>
    <motion.span
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
    />
    <motion.span
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
    />
    <motion.span
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
    />
  </div>
);

export default function Product() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setShowTyping(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section id="product" className={styles.product}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          プロダクト
        </motion.h2>

        <div className={styles.productIntro}>
          <motion.p 
            className="text-lead"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            生徒が語り、教員は要点だけを受け取る。
          </motion.p>
          <motion.p 
            className="text-body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            生徒側は、構えずに話せるチャット。教員側は、対応が必要な生徒だけが浮かび上がる要点レポート。<strong>会話ログそのものが共有されることはありません。</strong>
          </motion.p>
        </div>

        <div className={styles.productShowcase} ref={ref}>
          {/* Student chat mockup */}
          <motion.div 
            className={styles.productPanel}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className={styles.productPanelTag}>生徒の画面</span>
            <div className={styles.mockChat}>
              <div className={styles.mockChatHeader}>
                <span className={styles.mockChatDot}></span>
                <span className={styles.mockChatTitle}>blesc</span>
              </div>
              <div className={styles.mockChatBody}>
                {isInView && (
                  <>
                    <motion.div 
                      className={`${styles.bubble} ${styles.bubbleAi}`}
                      initial={{ opacity: 0, scale: 0.8, originX: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      最近、学校はどんな感じ？
                    </motion.div>
                    <motion.div 
                      className={`${styles.bubble} ${styles.bubbleMe}`}
                      initial={{ opacity: 0, scale: 0.8, originX: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 }}
                    >
                      うーん、ちょっと疲れてるかも
                    </motion.div>
                    <motion.div 
                      className={`${styles.bubble} ${styles.bubbleAi}`}
                      initial={{ opacity: 0, scale: 0.8, originX: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.8 }}
                    >
                      そっか。ちゃんと眠れてる？
                    </motion.div>
                    {showTyping && <TypingIndicator />}
                  </>
                )}
              </div>
              <div className={styles.mockChatInput}>
                <span>メッセージを入力…</span>
                <span className="material-symbols-outlined">send</span>
              </div>
            </div>
            <p className={styles.productCaption}>構えずに話せる、月に一度の対話。</p>
          </motion.div>

          {/* Teacher report mockup */}
          <motion.div 
            className={styles.productPanel}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className={styles.productPanelTag}>教員の画面</span>
            <div className={styles.mockReport}>
              <div className={styles.mockReportHeader}>
                <span className={styles.mockReportTitle}>今月のリスクレポート</span>
                <span className={styles.mockReportBadge}>3件の要対応</span>
              </div>
              <ul className={styles.mockReportList}>
                <li className={styles.mockReportRow}>
                  <span className={styles.mockReportId}>3年2組 #14</span>
                  <span className={styles.riskMeter}><span className={`${styles.riskFill} ${styles.riskHigh}`}></span></span>
                  <span className={`${styles.riskLabel} ${styles.riskLabelHigh}`}>高</span>
                </li>
                <li className={styles.mockReportRow}>
                  <span className={styles.mockReportId}>3年1組 #08</span>
                  <span className={styles.riskMeter}><span className={`${styles.riskFill} ${styles.riskMid}`}></span></span>
                  <span className={`${styles.riskLabel} ${styles.riskLabelMid}`}>中</span>
                </li>
                <li className={styles.mockReportRow}>
                  <span className={styles.mockReportId}>3年2組 #27</span>
                  <span className={styles.riskMeter}><span className={`${styles.riskFill} ${styles.riskMid}`}></span></span>
                  <span className={`${styles.riskLabel} ${styles.riskLabelMid}`}>中</span>
                </li>
                <li className={styles.mockReportRow}>
                  <span className={styles.mockReportId}>3年3組 #03</span>
                  <span className={styles.riskMeter}><span className={`${styles.riskFill} ${styles.riskLow}`}></span></span>
                  <span className={`${styles.riskLabel} ${styles.riskLabelLow}`}>低</span>
                </li>
              </ul>
              <div className={styles.mockReportNote}>
                <span className="material-symbols-outlined">lock</span>
                会話ログは共有されません
              </div>
            </div>
            <p className={styles.productCaption}>届くのは要点のみ。会話の中身は非公開。</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
