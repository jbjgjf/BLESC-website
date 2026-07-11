"use client";
import { motion } from "framer-motion";
import styles from "./Philosophy.module.css";

export default function Philosophy() {
  return (
    <section id="philosophy" className={styles.philosophy}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          私たちの理念
        </motion.h2>

        <div className={styles.philosophyContent}>
          <motion.p 
            className={styles.philosophyLead}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            声にならないSOSに、気づける社会へ。
          </motion.p>

          <div className={styles.philosophyStory}>
            {[
              "私たちはテクノロジーに囲まれて生きながら、人と人とのつながりは、かつてないほど希薄になっています。",
              "私たち自身、身近な友人が抱えていた苦しみに誰も気づけないまま手遅れになる状況を、目の当たりにしてきました。<strong>サインは、確かにそこにあったはずでした。</strong>",
              "苦しんでいる人に気づけるのが「何かが起きた後」だけ。<strong>私たちは、その現実を受け入れることができませんでした。</strong>",
              "忙しい学校生活のなかで消えていく、小さく静かなSOS。Blescは、その声を聴き逃さないための仕組みです。<strong>誰かが孤立する前に、見えないものを可視化する。</strong>それが、私たちがBlescをつくる理由です。"
            ].map((text, i) => (
              <motion.p 
                key={i}
                className="text-body"
                dangerouslySetInnerHTML={{ __html: text }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
