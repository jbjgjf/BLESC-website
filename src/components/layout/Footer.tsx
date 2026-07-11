"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const navLinks = [
    { href: "#reality", label: "現実" },
    { href: "#how-it-works", label: "仕組み" },
    { href: "#why-blesc", label: "選ばれる理由" },
    { href: "#technology", label: "テクノロジー" },
    { href: "#philosophy", label: "理念" },
    { href: "#team", label: "チーム" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLogo}>
          <Image 
            src="/assets/logo_with_flower.png" 
            alt="blesc logo" 
            width={120} 
            height={38} 
            className={styles.footerWordmarkImg} 
          />
        </div>
        <div className={styles.footerLinks}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <p className={styles.footerCopyright}>© 2026 blesc. All rights reserved.</p>
      </div>
    </footer>
  );
}
