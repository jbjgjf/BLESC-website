"use client";
import { motion } from "framer-motion";
import styles from "./Process.module.css";

export default function Process() {
  const steps = [
    {
      num: "01",
      title: "お問い合わせ",
      text: "資料請求・導入相談フォームからご連絡ください。<strong>最短即日でご返信</strong>します。"
    },
    {
      num: "02",
      title: "ヒアリング",
      text: "学校の状況や課題を伺い、<strong>最適な運用の形</strong>をご提案します。"
    },
    {
      num: "03",
      title: "試験導入",
      text: "一部の学年・クラスから<strong>スモールスタート</strong>。効果を確かめながら進めます。"
    },
    {
      num: "04",
      title: "本導入",
      text: "全校展開と、<strong>継続的な運用サポート</strong>。導入後も伴走します。"
    }
  ];

  return (
    <section id="process" className={styles.process}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          導入までの流れ
        </motion.h2>

        <div className={styles.processGrid}>
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={styles.processStep}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className={styles.processHeader}>
                <span className={styles.processNum}>{step.num}</span>
                <h3 className={styles.processTitle}>{step.title}</h3>
              </div>
              <p className={styles.processText} dangerouslySetInnerHTML={{ __html: step.text }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
