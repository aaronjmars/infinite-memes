import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.innerContainer}>
        <div className={styles.content}>
          <span className={styles.text}>By</span>
          <a
            href="https://merv.wtf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <img src="merv.png" alt="Merv logo" className={styles.smallLogo} />
          </a>
          <span className={styles.text}>, powered by</span>
          <a
            href="https://glif.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.link} flex items-center`}
          >
            <img
              src="glif_logo.png"
              alt="Glif logo"
              className={styles.smallLogo}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;