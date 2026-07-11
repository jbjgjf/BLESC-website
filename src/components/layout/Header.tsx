"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "#reality", label: "現実" },
    { href: "#how-it-works", label: "仕組み" },
    { href: "#product", label: "プロダクト" },
    { href: "#why-blesc", label: "選ばれる理由" },
    { href: "#technology", label: "テクノロジー" },
    { href: "#philosophy", label: "理念" },
    { href: "#team", label: "チーム" },
  ];

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogo}>
            <Image src="/assets/flower.png" alt="blesc flower logo" width={28} height={28} className={styles.headerFlowerIcon} />
            <Image src="/assets/logo_with_flower.png" alt="blesc logo type" width={100} height={16} className={styles.headerWordmark} />
          </div>

          <nav className={styles.navDesktop}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerCtas}>
            <Link href="#contact" className="btn-outline">
              資料請求
            </Link>
            <Link href="#contact" className="btn-solid">
              導入のご相談
            </Link>
          </div>

          <button className={styles.menuTrigger} onClick={toggleMobileMenu} aria-label="メニューを開く">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileNavOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className={styles.menuClose} onClick={toggleMobileMenu} aria-label="メニューを閉じる">
              <span className="material-symbols-outlined">close</span>
            </button>
            <nav className={styles.navMobile}>
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Link href={link.href} onClick={toggleMobileMenu}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className={styles.mobileCtas}>
                <Link href="#contact" className="btn-outline" onClick={toggleMobileMenu}>
                  資料請求
                </Link>
                <Link href="#contact" className="btn-solid" onClick={toggleMobileMenu}>
                  導入のご相談
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
