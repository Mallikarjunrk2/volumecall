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
  const inputPaddingClass = isLarge ? "pl-12 pr-12 py-3.5 text-sm sm:text-base" : "pl-9 pr-9 py-1.5 text-xs";
  const searchIconClass = isLarge ? "left-4 h-5 w-5" : "left-3 h-4 w-4";
  const spinnerClass = isLarge ? "right-4 h-5 w-5" : "right-3 h-4 w-4";
  const dropdownMarginClass = isLarge ? "mt-2" : "mt-1";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className={`absolute text-neutral-400 pointer-events-none ${searchIconClass}`} size={16} strokeWidth={1.8} aria-hidden="true" />
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
          className={`w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 placeholder:text-neutral-400 text-[var(--foreground)] transition-all duration-150 ${inputPaddingClass}`}
        />
        {loading && (
          <Loader2 className={`absolute text-neutral-400 animate-spin ${spinnerClass}`} size={16} strokeWidth={1.8} aria-hidden="true" />
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className={`absolute top-full left-0 right-0 z-50 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-lg max-h-60 overflow-y-auto ${dropdownMarginClass}`}>
          {error ? (
            <div className="px-3 py-4 text-xs text-red-500 flex items-center justify-center space-x-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : results.length > 0 ? (
            <ul role="listbox" className="py-1">
              {results.map((item, idx) => (
                <li
                  key={item.instrumentKey}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    idx === activeIndex
                      ? "bg-[var(--background-secondary)] text-[var(--foreground)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-[var(--foreground)]">{item.symbol}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xs text-[9px] font-mono uppercase text-[var(--text-secondary)]">
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
              <div className="px-3 py-4 text-xs text-[var(--text-secondary)] text-center">
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
