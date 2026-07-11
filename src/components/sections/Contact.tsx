"use client";
import { motion } from "framer-motion";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <section id="contact" className={styles.contact}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          導入のご相談・資料請求
        </motion.h2>
        
        <motion.p 
          className={styles.contactDesc}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Blescは、教育委員会や私立・公立学校での導入を進めています。システム詳細や導入ステップについて、お気軽にお問い合わせください。
        </motion.p>
        
        <motion.form 
          className={styles.contactForm}
          action="https://formspree.io/f/your-form-id" 
          method="POST"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <input type="hidden" name="_subject" value="blescサイトからのお問い合わせ" />

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="cf-org">学校・団体名 <span className={styles.req} aria-hidden="true">*</span></label>
              <input type="text" id="cf-org" name="学校・団体名" required aria-required="true" autoComplete="organization" />
            </div>
            <div className={styles.formField}>
              <label htmlFor="cf-name">お名前 <span className={styles.req} aria-hidden="true">*</span></label>
              <input type="text" id="cf-name" name="お名前" required aria-required="true" autoComplete="name" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="cf-email">メールアドレス <span className={styles.req} aria-hidden="true">*</span></label>
              <input type="email" id="cf-email" name="メール" required aria-required="true" autoComplete="email" />
            </div>
            <div className={styles.formField}>
              <label htmlFor="cf-type">お問い合わせ種別</label>
              <select id="cf-type" name="種別">
                <option value="資料請求">資料請求</option>
                <option value="導入のご相談">導入のご相談</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="cf-message">メッセージ</label>
            <textarea id="cf-message" name="メッセージ" rows={4} placeholder="ご質問やご要望があればご記入ください（任意）"></textarea>
          </div>

          <button type="submit" className={`btn-solid btn-large ${styles.formSubmit}`}>
            <span className="material-symbols-outlined" aria-hidden="true">send</span>
            送信する
          </button>
        </motion.form>

        <motion.p 
          className={styles.contactFallback}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          フォームがうまく動かない場合は
          <a href="mailto:info@blesc.jp?subject=導入のご相談・資料請求について">info@blesc.jp</a>
          まで直接ご連絡ください。
        </motion.p>
      </div>
    </section>
  );
}
