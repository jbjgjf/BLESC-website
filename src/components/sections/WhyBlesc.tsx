"use client";
import { motion } from "framer-motion";
import styles from "./WhyBlesc.module.css";

export default function WhyBlesc() {
  const benefits = [
    {
      num: "01",
      title: "心理的安全性",
      text: "チャットログは完全に非公開。<strong>見られる不安がない</strong>からこそ、生徒は本音を語れます。"
    },
    {
      num: "02",
      title: "早期検知",
      text: "孤立する前に、<strong>隠れたリスクを自動でアラート。</strong>教員の追加業務は発生しません。"
    },
    {
      num: "03",
      title: "全生徒をカバー",
      text: "学校インフラ上で稼働するため、任意ダウンロードに依存せず、<strong>全生徒にリーチします。</strong>"
    },
    {
      num: "04",
      title: "科学的な裏付け",
      text: "<strong>医学研究にもとづくモデル</strong>が、解析に厳密な根拠を与えます。"
    }
  ];

  return (
    <section id="why-blesc" className={styles.whyBlesc}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          blescが選ばれる理由
        </motion.h2>

        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className={styles.benefitItem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, backgroundColor: "var(--bg-elevated)" }}
            >
              <div className={styles.benefitHeader}>
                <span className={styles.benefitNum}>{benefit.num}</span>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              </div>
              <p className={styles.benefitText} dangerouslySetInnerHTML={{ __html: benefit.text }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
