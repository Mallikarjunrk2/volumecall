"use client";

import React, { useState } from "react";

export const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  RELIANCE: "ril.com",
  TCS: "tcs.com",
  HDFCBANK: "hdfcbank.com",
  INFY: "infosys.com",
  BHARTIARTL: "airtel.in",
  ICICIBANK: "icicibank.com",
  SBIN: "sbi.co.in",
  AXISBANK: "axisbank.com",
  KOTAKBANK: "kotak.com",
  BAJFINANCE: "bajajfinserv.in",
  LT: "larsentoubro.com",
  ITC: "itcportal.com",
  MARUTI: "marutisuzuki.com",
  TATAMOTORS: "tatamotors.com",
  SUNPHARMA: "sunpharma.com",
  WIPRO: "wipro.com",
  HCLTECH: "hcltech.com",
  ASIANPAINT: "asianpaints.com",
  TITAN: "titancompany.in",
  NESTLEIND: "nestle.in",
  ULTRACEMCO: "ultratechcement.com",
  NTPC: "ntpc.co.in",
  ONGC: "ongcindia.com",
  POWERGRID: "powergrid.in",
  COALINDIA: "coalindia.in",
  TATASTEEL: "tatasteel.com",
  JSWSTEEL: "jsw.in",
  HINDALCO: "hindalco.com",
  ZOMATO: "zomato.com",
  TRENT: "trentlimited.com",
};

interface CompanyLogoProps {
  symbol: string;
  isin?: string | null;
  domain?: string | null;
  companyName: string;
  className?: string;
  textClassName?: string;
}

export function CompanyLogo({
  symbol,
  isin,
  domain,
  companyName,
  className = "h-12 w-12 rounded-lg",
  textClassName = "text-lg",
}: CompanyLogoProps) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
  const hasKey = token && token.trim() !== "" && token !== "YOUR_KEY" && token !== "YOUR_LOGO_DEV_PUBLISHABLE_KEY";

  const cleanSym = symbol.toUpperCase();
  const effectiveDomain = domain || KNOWN_COMPANY_DOMAINS[cleanSym];

  const getDomainUrl = (dom: string) =>
    `https://img.logo.dev/${dom.toLowerCase()}?token=${token}&size=128&format=webp&retina=true`;

  const getIsinUrl = (is: string) =>
    `https://img.logo.dev/isin/${is.toUpperCase()}?token=${token}&size=128&format=webp&retina=true`;

  const getTickerUrl = (sym: string) =>
    `https://img.logo.dev/ticker/${sym.toUpperCase()}?token=${token}&size=128&format=webp&retina=true`;

  // Resolution stages: "domain" -> "isin" -> "ticker" -> "failed"
  const getInitialStage = (): "domain" | "isin" | "ticker" | "failed" => {
    if (effectiveDomain) return "domain";
    if (isin) return "isin";
    return "ticker";
  };

  const [stage, setStage] = useState<"domain" | "isin" | "ticker" | "failed">(getInitialStage);
  const [prevKey, setPrevKey] = useState<string>("");

  const currentKey = `${symbol}-${isin || ""}-${effectiveDomain || ""}`;

  // Synchronously reset stage when inputs change
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setStage(getInitialStage());
  }

  // Synchronously compute current image source
  let imgSrc: string | null = null;
  if (hasKey) {
    if (stage === "domain" && effectiveDomain) {
      imgSrc = getDomainUrl(effectiveDomain);
    } else if (stage === "isin" && isin) {
      imgSrc = getIsinUrl(isin);
    } else if (stage === "ticker" || stage === "domain" || stage === "isin") {
      imgSrc = getTickerUrl(symbol);
    }
  }

  const handleError = () => {
    if (stage === "domain") {
      if (isin) {
        setStage("isin");
      } else {
        setStage("ticker");
      }
    } else if (stage === "isin") {
      setStage("ticker");
    } else {
      setStage("failed");
    }
  };

  const getInitials = () => {
    if (companyName && companyName !== symbol) {
      const words = companyName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w && !/^(limited|ltd|co|industries)$/i.test(w));
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      } else if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
      }
    }
    return symbol.slice(0, 2).toUpperCase();
  };

  if (imgSrc && stage !== "failed") {
    return (
      <div className={`${className} overflow-hidden shrink-0 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`${companyName} logo`}
          className="block w-full h-full object-contain p-1 rounded-full scale-105"
          onError={handleError}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`${className} bg-neutral-100 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center font-bold text-[#0F766E] dark:text-teal-400 shrink-0`}>
      <span className={textClassName}>{getInitials()}</span>
    </div>
  );
}


