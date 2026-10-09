"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./about.module.scss";

const EMAIL = "manaskhairnar1511@gmail.com";

const istTime = () =>
  new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });

export function LocalTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    setT(istTime());
    const id = setInterval(() => setT(istTime()), 30000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || "--:--"}</span>;
}

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onClick = async () => {
    try {
      await navigator.clipboard?.writeText(EMAIL);
    } catch {}
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" className={styles.copy} onClick={onClick}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
