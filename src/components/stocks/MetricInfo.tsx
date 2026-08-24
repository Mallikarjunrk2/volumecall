"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { METRIC_EDUCATION_MAP, MetricEducationItem } from "@/lib/stocks/metricEducation";

interface MetricInfoProps {
  metricKey: string;
  label?: string;
  metricArticles?: Record<string, string>;
  activeMetric?: string | null;
  onToggleActive?: (key: string | null) => void;
  className?: string;
}

export function MetricInfo({
  metricKey,
  label,
  metricArticles = {},
  activeMetric,
  onToggleActive,
  className = "",
}: MetricInfoProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const education: MetricEducationItem | undefined = METRIC_EDUCATION_MAP[metricKey];

  // If no education entry exists for this metric, return label only (or null) without ⓘ icon
  if (!education) {
    return label ? <span className={className}>{label}</span> : null;
  }

  const isOpen = onToggleActive ? activeMetric === metricKey : internalOpen;

  const toggleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleActive) {
      onToggleActive(isOpen ? null : metricKey);
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const closePopup = () => {
    if (onToggleActive) {
      onToggleActive(null);
    } else {
      setInternalOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePopup();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const articleUrl = metricArticles[metricKey] || null;

  return (
    <span ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {label && <span>{label}</span>}
      
      <button
        type="button"
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleOpen(e);
          }
        }}
        aria-label={`Education info for ${education.title}`}
        aria-expanded={isOpen}
        className="ml-1 text-neutral-400 hover:text-emerald-500 dark:hover:text-teal-400 focus:outline-none transition-colors cursor-pointer text-xs font-mono select-none"
      >
        ⓘ
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={education.title}
          className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-4 bg-neutral-900 text-white rounded-xl shadow-2xl border border-neutral-800 text-xs space-y-3 font-sans animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <h4 className="font-bold text-emerald-400 text-sm">{education.title}</h4>
            <button
              onClick={closePopup}
              className="text-neutral-400 hover:text-white p-0.5 text-xs font-mono cursor-pointer"
              aria-label="Close popup"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block mb-0.5">
                What is it?
              </span>
              <p className="text-neutral-300 leading-relaxed font-normal">{education.shortDefinition}</p>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block mb-0.5">
                Why it matters
              </span>
              <p className="text-neutral-300 leading-relaxed font-normal">{education.whyItMatters}</p>
            </div>
          </div>

          {articleUrl && (
            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <Link
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closePopup}
                className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center space-x-1 hover:underline text-xs"
              >
                <span>Read full guide</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export default MetricInfo;
