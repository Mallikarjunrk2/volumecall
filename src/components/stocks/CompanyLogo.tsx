"use client";

import React, { useState } from "react";

interface CompanyLogoProps {
  symbol: string;
  isin?: string | null;
  companyName: string;
  className?: string;
  textClassName?: string;
}

export function CompanyLogo({
  symbol,
  isin,
  companyName,
  className = "h-12 w-12 rounded-lg",
  textClassName = "text-lg",
}: CompanyLogoProps) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
  const hasKey = token && token.trim() !== "" && token !== "YOUR_KEY" && token !== "YOUR_LOGO_DEV_PUBLISHABLE_KEY";

  const getIsinUrl = (is: string) =>
    `https://img.logo.dev/isin/${is.toUpperCase()}?token=${token}&size=128&format=webp&retina=true`;

  const getTickerUrl = (sym: string) =>
    `https://img.logo.dev/ticker/${sym.toUpperCase()}?token=${token}&size=128&format=webp&retina=true`;

  // Track the current resolution stage: "isin" | "ticker" | "failed"
  const [stage, setStage] = useState<"isin" | "ticker" | "failed">("isin");
  const [prevKey, setPrevKey] = useState<string>("");

  const currentKey = `${symbol}-${isin || ""}`;

  // Synchronously reset stage when symbol or ISIN changes
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setStage(isin ? "isin" : "ticker");
  }

  // Synchronously compute current image source
  let imgSrc: string | null = null;
  if (hasKey) {
    if (stage === "isin" && isin) {
      imgSrc = getIsinUrl(isin);
    } else if (stage === "isin" || stage === "ticker") {
      imgSrc = getTickerUrl(symbol);
    }
  }

  const handleError = () => {
    if (stage === "isin" && isin) {
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
      <div className={`${className} overflow-hidden shrink-0 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white`}>
        <img
          src={imgSrc}
          alt={`${companyName} logo`}
          className="block w-full h-full object-contain"
          onError={handleError}
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
