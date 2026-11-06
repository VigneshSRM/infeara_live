"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

export function Analytics() {
  const pathname = usePathname();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const sync = () => setGranted(window.localStorage.getItem("infeara-consent") === "granted");
    sync();
    window.addEventListener("infeara-consent-change", sync);
    return () => window.removeEventListener("infeara-consent-change", sync);
  }, []);

  useEffect(() => {
    if (!granted || !GA_ID) return;
    if (pathname.startsWith("/admin")) return;
    if (document.getElementById("ga4-script")) return;

    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const inline = document.createElement("script");
    inline.id = "ga4-init";
    inline.textContent = [
      "window.dataLayer = window.dataLayer || [];",
      "function gtag(){dataLayer.push(arguments);}",
      "gtag('js', new Date());",
      `gtag('config', '${GA_ID}', { anonymize_ip: true });`,
    ].join("");
    document.head.appendChild(inline);
  }, [granted]);

  return null;
}
