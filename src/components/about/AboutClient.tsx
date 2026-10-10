"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./about.module.scss";

const timeIn = (timeZone: string) =>
  new Date().toLocaleTimeString("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" });

export function LocalTime({ timeZone }: { timeZone: string }) {
  const [t, setT] = useState("");
  useEffect(() => {
    setT(timeIn(timeZone));
    const id = setInterval(() => setT(timeIn(timeZone)), 30000);
    return () => clearInterval(id);
  }, [timeZone]);
  return <span suppressHydrationWarning>{t || "--:--"}</span>;
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onClick = async () => {
    try {
      await navigator.clipboard?.writeText(email);
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
