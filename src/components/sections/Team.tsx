"use client";
import { motion } from "framer-motion";
import styles from "./Team.module.css";

export default function Team() {
  const teamMembers = Array(5).fill({
    role: "役職",
    name: "お名前",
    enName: "Name"
  });

  return (
    <section id="team" className={styles.team}>
      <div className="section-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          チーム
        </motion.h2>

        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index}
              className={styles.teamMember}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className={styles.teamAvatar} aria-hidden="true">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className={styles.memberRole}>{member.role}</span>
              <span className={styles.memberName}>{member.name}</span>
              <span className={styles.memberEn}>{member.enName}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
