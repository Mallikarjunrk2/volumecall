"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { SearchInstrument } from "@/lib/stocks/types";

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  size?: "normal" | "large";
}

export function SearchAutocomplete({
  placeholder = "Search stocks, sectors or industries...",
  className = "",
  size = "normal",
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchInstrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
          setActiveIndex(-1);
        } else {
          setResults([]);
          setError("Failed to fetch search results. Please try again.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to fetch autocomplete results:", err);
          setResults([]);
          setError("Network error. Check your connection.");
        }
      } finally {
        setLoading(false);
      }
    }, 250); // 250ms debounce

    return () => {
      controller.abort();
      clearTimeout(delayDebounce);
    };
  }, [query]);

  const handleSelect = (instrument: SearchInstrument) => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    setError(null);
    inputRef.current?.blur();
    
    // Navigate to stock page
    router.push(`/stocks/${instrument.symbol.toLowerCase()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Size styling configuration
  const isLarge = size === "large";
  const inputPaddingClass = isLarge
    ? "pl-11 pr-11 py-3.5 sm:py-4 text-sm sm:text-base h-[52px] sm:h-[56px]"
    : "pl-8 pr-8 py-1.5 text-xs h-[34px]";
  const searchIconClass = isLarge ? "left-4 h-4 w-4" : "left-2.5 h-3.5 w-3.5";
  const spinnerClass = isLarge ? "right-4 h-4 w-4" : "right-2.5 h-3.5 w-3.5";
  const dropdownMarginClass = isLarge ? "mt-2" : "mt-1";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className={`absolute text-[var(--text-muted)] pointer-events-none ${searchIconClass}`} size={16} strokeWidth={1.8} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
            if (val.trim().length < 2) {
              setResults([]);
              setError(null);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs focus:outline-none focus:border-[var(--border-strong)] placeholder:text-[var(--text-muted)] text-[var(--text-primary)] transition-colors ${inputPaddingClass}`}
        />
        {loading && (
          <Loader2 className={`absolute text-[var(--text-muted)] animate-spin ${spinnerClass}`} size={16} strokeWidth={1.8} aria-hidden="true" />
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className={`absolute top-full left-0 right-0 z-50 bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] rounded-xs shadow-xl max-h-64 overflow-y-auto ${dropdownMarginClass}`}>
          {error ? (
            <div className="px-3 py-4 text-xs text-red-400 flex items-center justify-center space-x-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : results.length > 0 ? (
            <ul role="listbox" className="py-1 divide-y divide-[var(--border-subtle)]">
              {results.map((item, idx) => (
                <li
                  key={item.instrumentKey}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    idx === activeIndex
                      ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold font-mono text-xs text-[var(--text-primary)]">{item.symbol}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-[200px] sm:max-w-xs md:max-w-md font-sans">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xs text-[9px] font-mono uppercase text-[var(--text-muted)]">
                      {item.exchange}
                    </span>
                    {item.isin && (
                      <span className="hidden sm:inline text-[var(--text-muted)] font-mono text-[10px]">
                        {item.isin}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="px-3 py-4 text-xs text-[var(--text-muted)] text-center font-sans">
                No stocks found for &ldquo;{query}&rdquo;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
export default SearchAutocomplete;

