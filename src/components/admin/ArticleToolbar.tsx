"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { uploadMediaAction } from "@/lib/cms/media-actions";
import {
  ALL_CALCULATORS,
  CALCULATOR_CATEGORIES,
} from "@/lib/cms/calculator-registry";
import {
  SOCIAL_EMBED_OPTIONS,
  SocialEmbedOption,
  validateSocialEmbed,
} from "@/lib/cms/social-registry";
import {
  Image as ImageIcon,
  Calculator,
  TrendingUp,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Loader2,
  ChevronDown,
  X,
  Search,
  Plus,
  Share2,
  Play,
  Camera,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface ArticleToolbarProps {
  onInsertText: (textToInsert: string) => void;
}

interface InstrumentResult {
  symbol: string;
  name: string;
  exchange?: string;
}

export function ArticleToolbar({ onInsertText }: ArticleToolbarProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCalcDropdown, setShowCalcDropdown] = useState(false);
  const [calcSearch, setCalcSearch] = useState("");
  
  // Social Modal & Dropdown State
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const [selectedSocialOption, setSelectedSocialOption] = useState<SocialEmbedOption | null>(null);
  const [socialUrlInput, setSocialUrlInput] = useState("");
  const [socialUrlError, setSocialUrlError] = useState<string | null>(null);

  // Stock Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [stockResults, setStockResults] = useState<InstrumentResult[]>([]);
  const [searchingStocks, setSearchingStocks] = useState(false);

  // Comparison Modal State
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareSearch, setCompareSearch] = useState("");
  const [compareResults, setCompareResults] = useState<InstrumentResult[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["RELIANCE", "TCS"]);
  const [searchingCompare, setSearchingCompare] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const calcDropdownRef = useRef<HTMLDivElement>(null);
  const socialDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calcDropdownRef.current && !calcDropdownRef.current.contains(event.target as Node)) {
        setShowCalcDropdown(false);
        setCalcSearch("");
      }
      if (socialDropdownRef.current && !socialDropdownRef.current.contains(event.target as Node)) {
        setShowSocialDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered calculators for search
  const filteredCalculators = useMemo(() => {
    const q = calcSearch.trim().toLowerCase();
    if (!q) return ALL_CALCULATORS;
    return ALL_CALCULATORS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [calcSearch]);

  // Stock search effect
  useEffect(() => {
    if (!showStockModal || stockSearch.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingStocks(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(stockSearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setStockResults(Array.isArray(data) ? data.slice(0, 8) : []);
        }
      } catch (err) {
        console.error("Failed to search stocks:", err);
      } finally {
        setSearchingStocks(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [stockSearch, showStockModal]);

  // Compare search effect
  useEffect(() => {
    if (!showCompareModal || compareSearch.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingCompare(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(compareSearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setCompareResults(Array.isArray(data) ? data.slice(0, 8) : []);
        }
      } catch (err) {
        console.error("Failed to search compare stocks:", err);
      } finally {
        setSearchingCompare(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [compareSearch, showCompareModal]);

  // In-Body Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadMediaAction(formData);
      if (res.success && res.url) {
        const alt = file.name.replace(/\.[^/.]+$/, "");
        const markdownImg = `\n\n![${alt}](${res.url})\n\n`;
        onInsertText(markdownImg);
      } else {
        alert(res.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Toolbar image upload error:", err);
      alert("Error uploading image to storage.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Calculator selection
  const handleInsertCalculator = (calcId: string) => {
    onInsertText(`\n\n::calculator{id="${calcId}"}\n\n`);
    setShowCalcDropdown(false);
    setCalcSearch("");
  };

  // Social selection
  const handleSelectSocialOption = (option: SocialEmbedOption) => {
    setSelectedSocialOption(option);
    setShowSocialDropdown(false);
    setSocialUrlInput("");
    setSocialUrlError(null);
  };

  const handleInsertSocialEmbed = () => {
    if (!selectedSocialOption) return;

    const parsed = validateSocialEmbed(
      selectedSocialOption.platform,
      socialUrlInput,
      selectedSocialOption.type
    );

    if (!parsed || !parsed.valid) {
      setSocialUrlError(
        `Invalid ${selectedSocialOption.label} URL. Please enter a valid link matching ${selectedSocialOption.placeholder}`
      );
      return;
    }

    const typeAttr = parsed.type ? ` type="${parsed.type}"` : "";
    const directive = `\n\n::social{platform="${parsed.platform}"${typeAttr} url="${parsed.normalizedUrl}"}\n\n`;
    
    onInsertText(directive);
    setSelectedSocialOption(null);
    setSocialUrlInput("");
    setSocialUrlError(null);
  };

  // Stock selection
  const handleSelectStock = (symbol: string) => {
    const clean = symbol.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (clean) {
      onInsertText(`\n\n::stock{symbol="${clean}"}\n\n`);
      setShowStockModal(false);
      setStockSearch("");
      setStockResults([]);
    }
  };

  // Comparison selection
  const handleAddCompareSymbol = (symbol: string) => {
    const clean = symbol.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (clean && !selectedSymbols.includes(clean) && selectedSymbols.length < 5) {
      setSelectedSymbols([...selectedSymbols, clean]);
      setCompareSearch("");
      setCompareResults([]);
    }
  };

  const handleRemoveCompareSymbol = (sym: string) => {
    setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
  };

  const handleInsertComparison = () => {
    if (selectedSymbols.length < 2) {
      alert("Please select at least 2 stock symbols to compare.");
      return;
    }
    const cleanSymbols = selectedSymbols.slice(0, 5).join(",");
    onInsertText(`\n\n::comparison{symbols="${cleanSymbols}"}\n\n`);
    setShowCompareModal(false);
    setCompareSearch("");
    setCompareResults([]);
  };

  // Callouts
  const handleInsertTip = () => {
    onInsertText(`\n\n:::tip[Key Insight]\nWrite your key analytical takeaway here.\n:::\n\n`);
  };

  const handleInsertWarning = () => {
    onInsertText(`\n\n:::warning[Risk Warning]\nHighlight important investment risks or assumptions here.\n:::\n\n`);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs relative z-20">
      <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase px-2">
        Insert:
      </span>

      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleImageUpload}
        className="hidden"
        id="toolbar-image-upload"
        disabled={uploadingImage}
      />

      {/* In-Body Image Button */}
      <label
        htmlFor="toolbar-image-upload"
        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors ${
          uploadingImage ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {uploadingImage ? (
          <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-teal)]" />
        ) : (
          <ImageIcon className="w-3 h-3 text-[var(--accent-teal)]" />
        )}
        <span>{uploadingImage ? "Uploading..." : "Image"}</span>
      </label>

      {/* ─── CALCULATOR DROPDOWN / SEARCH PICKER ──────────────────────────── */}
      <div ref={calcDropdownRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowCalcDropdown(!showCalcDropdown)}
          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
            showCalcDropdown
              ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--accent-teal)]"
              : "bg-[var(--bg-base)] border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Calculator className="w-3 h-3 text-[var(--accent-teal)]" />
          <span>Calculator ({ALL_CALCULATORS.length})</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {showCalcDropdown && (
          <div className="absolute left-0 top-full mt-1.5 w-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden max-h-[440px]">
            {/* Search Input Header */}
            <div className="p-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] sticky top-0 z-10 space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search 27 calculators (e.g. SIP, DCF, EMI)..."
                  value={calcSearch}
                  onChange={(e) => setCalcSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
                {calcSearch && (
                  <button
                    type="button"
                    onClick={() => setCalcSearch("")}
                    className="absolute right-2 top-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Calculator Items */}
            <div className="overflow-y-auto divide-y divide-[var(--border-subtle)] p-1">
              {calcSearch.trim() ? (
                // Filtered Search Results List
                <div className="p-1 space-y-1">
                  {filteredCalculators.length > 0 ? (
                    filteredCalculators.map((calc) => (
                      <button
                        key={calc.id}
                        type="button"
                        onClick={() => handleInsertCalculator(calc.id)}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[var(--bg-base)] rounded group transition-colors block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)]">
                            {calc.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                            {calc.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {calc.description}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                      No calculators match &ldquo;{calcSearch}&rdquo;.
                    </div>
                  )}
                </div>
              ) : (
                // Grouped by 6 Categories
                CALCULATOR_CATEGORIES.map((category) => {
                  const items = ALL_CALCULATORS.filter((c) => c.category === category);
                  return (
                    <div key={category} className="py-1.5 first:pt-0 last:pb-0">
                      <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-teal)]">
                        {category}
                      </div>
                      <div className="space-y-0.5 px-1">
                        {items.map((calc) => (
                          <button
                            key={calc.id}
                            type="button"
                            onClick={() => handleInsertCalculator(calc.id)}
                            className="w-full text-left px-2 py-1.5 hover:bg-[var(--bg-base)] rounded group transition-colors block"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-teal)]">
                                {calc.name}
                              </span>
                              <span className="text-[9px] font-mono text-[var(--text-muted)] opacity-70 group-hover:opacity-100">
                                ::{calc.id}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stock Quote Card Button */}
      <button
        type="button"
        onClick={() => setShowStockModal(true)}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
      >
        <TrendingUp className="w-3 h-3 text-[var(--accent-teal)]" />
        <span>Stock</span>
      </button>

      {/* Stock Comparison Button */}
      <button
        type="button"
        onClick={() => setShowCompareModal(true)}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
      >
        <BarChart3 className="w-3 h-3 text-[var(--accent-teal)]" />
        <span>Comparison</span>
      </button>

      {/* ─── SOCIAL MEDIA EMBED DROPDOWN ──────────────────────────────────── */}
      <div ref={socialDropdownRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowSocialDropdown(!showSocialDropdown)}
          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
            showSocialDropdown
              ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--accent-teal)]"
              : "bg-[var(--bg-base)] border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Share2 className="w-3 h-3 text-[var(--accent-teal)]" />
          <span>Social</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {showSocialDropdown && (
          <div className="absolute left-0 top-full mt-1.5 w-52 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-50 py-1.5">
            <div className="px-3 py-1 border-b border-[var(--border-subtle)] mb-1">
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Insert Social
              </span>
            </div>
            {SOCIAL_EMBED_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectSocialOption(opt)}
                className="w-full text-left px-3 py-2 hover:bg-[var(--bg-base)] hover:text-[var(--accent-teal)] transition-colors flex items-center space-x-2 group"
              >
                {opt.platform === "x" && <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                {opt.platform === "instagram" && <Camera className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                {opt.platform === "youtube" && <Play className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-teal)]">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tip Callout */}
      <button
        type="button"
        onClick={handleInsertTip}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
      >
        <Lightbulb className="w-3 h-3 text-[var(--accent-teal)]" />
        <span>Tip Box</span>
      </button>

      {/* Warning Callout */}
      <button
        type="button"
        onClick={handleInsertWarning}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-amber-500 text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
      >
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        <span>Warning Box</span>
      </button>

      {/* ─── SOCIAL EMBED MODAL ───────────────────────────────────────────── */}
      {selectedSocialOption && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center space-x-2">
                {selectedSocialOption.platform === "x" && <MessageSquare className="w-4 h-4 text-sky-400" />}
                {selectedSocialOption.platform === "instagram" && <Camera className="w-4 h-4 text-pink-500" />}
                {selectedSocialOption.platform === "youtube" && <Play className="w-4 h-4 text-red-500" />}
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Insert {selectedSocialOption.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedSocialOption(null);
                  setSocialUrlInput("");
                  setSocialUrlError(null);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] block">
                {selectedSocialOption.label} URL
              </label>
              <input
                type="url"
                autoFocus
                placeholder={selectedSocialOption.placeholder}
                value={socialUrlInput}
                onChange={(e) => {
                  setSocialUrlInput(e.target.value);
                  setSocialUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInsertSocialEmbed();
                  } else if (e.key === "Escape") {
                    setSelectedSocialOption(null);
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                {selectedSocialOption.description}
              </p>
              {socialUrlError && (
                <div className="flex items-center space-x-1.5 text-[11px] text-red-500 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{socialUrlError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setSelectedSocialOption(null);
                  setSocialUrlInput("");
                  setSocialUrlError(null);
                }}
                className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertSocialEmbed}
                disabled={!socialUrlInput.trim()}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                  socialUrlInput.trim()
                    ? "bg-[var(--accent-teal)] hover:bg-[#0EA5E9] text-white cursor-pointer"
                    : "bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed"
                }`}
              >
                Insert Embed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STOCK SEARCH MODAL ────────────────────────────────────────────── */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-teal)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Insert Stock Card</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStockModal(false);
                  setStockSearch("");
                  setStockResults([]);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Search symbol (e.g. RELIANCE, TCS, INFY)..."
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  if (e.target.value.trim().length < 2) {
                    setStockResults([]);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>

            {/* Quick popular symbols */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Popular:</span>
              {["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "TATAMOTORS"].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleSelectStock(sym)}
                  className="px-2 py-0.5 rounded bg-[var(--bg-base)] hover:bg-[var(--accent-teal)]/10 hover:text-[var(--accent-teal)] border border-[var(--border-subtle)] text-[10px] font-mono transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>

            {/* Search Results */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchingStocks ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] flex items-center justify-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-teal)]" />
                  <span>Searching stocks...</span>
                </div>
              ) : stockResults.length > 0 ? (
                stockResults.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => handleSelectStock(item.symbol)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--bg-base)] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent-teal)]">
                        {item.symbol}
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[280px]">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {item.exchange || "NSE"}
                    </span>
                  </button>
                ))
              ) : stockSearch.trim().length >= 2 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-[var(--text-muted)]">No stocks found for &ldquo;{stockSearch}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => handleSelectStock(stockSearch.trim().toUpperCase())}
                    className="mt-2 text-xs font-semibold text-[var(--accent-teal)] hover:underline"
                  >
                    Insert as manual symbol &ldquo;{stockSearch.trim().toUpperCase()}&rdquo;
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ─── COMPARISON MODAL ─────────────────────────────────────────────── */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[var(--accent-teal)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Insert Stock Comparison</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCompareModal(false);
                  setCompareSearch("");
                  setCompareResults([]);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Symbols List */}
            <div>
              <label className="text-[11px] font-medium text-[var(--text-secondary)] block mb-1.5">
                Selected Stocks (2 to 5):
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md min-h-[38px] items-center">
                {selectedSymbols.map((sym) => (
                  <span
                    key={sym}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--accent-teal)]/40 text-xs font-mono text-[var(--accent-teal)]"
                  >
                    <span>{sym}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompareSymbol(sym)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedSymbols.length === 0 && (
                  <span className="text-[11px] text-[var(--text-muted)] italic">
                    No stocks selected yet. Search below to add.
                  </span>
                )}
              </div>
            </div>

            {/* Search and add */}
            {selectedSymbols.length < 5 && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search stock to add to comparison..."
                    value={compareSearch}
                    onChange={(e) => {
                      setCompareSearch(e.target.value);
                      if (e.target.value.trim().length < 2) {
                        setCompareResults([]);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                </div>

                {/* Search Results */}
                {searchingCompare ? (
                  <div className="py-3 text-center text-xs text-[var(--text-muted)] flex items-center justify-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-teal)]" />
                    <span>Searching...</span>
                  </div>
                ) : compareResults.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1 p-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md">
                    {compareResults.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => handleAddCompareSymbol(item.symbol)}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[var(--bg-surface)] flex items-center justify-between group text-xs"
                      >
                        <span className="font-mono font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)]">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px]">
                          {item.name}
                        </span>
                        <Plus className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setShowCompareModal(false);
                  setCompareSearch("");
                  setCompareResults([]);
                }}
                className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertComparison}
                disabled={selectedSymbols.length < 2}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedSymbols.length >= 2
                    ? "bg-[var(--accent-teal)] hover:bg-[#0EA5E9] text-white cursor-pointer"
                    : "bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed"
                }`}
              >
                Insert Comparison ({selectedSymbols.length}/5)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleToolbar;
