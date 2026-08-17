"use client";

import { useState, useRef } from "react";
import { uploadMediaAction } from "@/lib/cms/media-actions";
import { UploadCloud, Image as ImageIcon, X, AlertCircle, Link as LinkIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string; // The current image URL (Blob or external)
  altText?: string;
  onChange: (url: string, altText?: string) => void;
  onAltTextChange?: (altText: string) => void;
}

export function ImageUploader({
  value,
  altText,
  onChange,
  onAltTextChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrlMode, setManualUrlMode] = useState(false);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    sizeKb: number;
    mimeType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    // Client preliminary checks (server will strictly re-validate)
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      setError(`Unsupported file type (${file.type}). Only JPEG, PNG, WebP, and AVIF are allowed.`);
      setUploading(false);
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 4 MB limit.`);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (altText) {
      formData.append("altText", altText);
    }

    try {
      const res = await uploadMediaAction(formData);
      if (res.success && res.url) {
        onChange(res.url, altText);
        setFileDetails({
          name: res.originalFilename || file.name,
          sizeKb: Math.round((res.sizeBytes || file.size) / 1024),
          mimeType: res.mimeType || file.type,
        });
      } else {
        setError(res.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while uploading.";
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setFileDetails(null);
    setError(null);
  };

  return (
    <div className="space-y-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
          <span>Featured Image</span>
        </h3>
        <button
          type="button"
          onClick={() => setManualUrlMode(!manualUrlMode)}
          className="text-[11px] text-[var(--accent-teal)] hover:underline flex items-center space-x-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{manualUrlMode ? "Upload File Mode" : "Paste HTTPS URL"}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-md flex items-start space-x-2 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Manual URL Input Fallback */}
      {manualUrlMode ? (
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">
            External Image URL (HTTPS)
          </label>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/images/article-cover.webp"
            className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
          />
        </div>
      ) : (
        /* Vercel Blob File Upload Mode */
        <div className="space-y-3">
          {!value ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileSelect}
                className="hidden"
                id="featured-image-file-input"
                disabled={uploading}
              />
              <label
                htmlFor="featured-image-file-input"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-teal)] rounded-lg cursor-pointer transition-colors bg-[var(--bg-base)] text-center ${
                  uploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center space-y-2 text-[var(--text-secondary)]">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-teal)]" />
                    <span className="text-xs font-medium">Uploading to storage...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-[var(--text-secondary)]">
                    <UploadCloud className="w-7 h-7 text-[var(--accent-teal)]" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Click to select image
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        JPEG, PNG, WebP, AVIF up to 4 MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          ) : (
            /* Active Image Preview */
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-md overflow-hidden border border-[var(--border-subtle)] bg-neutral-100 dark:bg-neutral-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt={altText || "Featured Image Preview"}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* File Meta Pill */}
              {fileDetails && (
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono px-2 py-1 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
                  <span className="truncate max-w-[180px]">{fileDetails.name}</span>
                  <span>{fileDetails.sizeKb} KB</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alt Text Field (Optional if onAltTextChange provided) */}
      {onAltTextChange && (
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">
            Image Alt Text (Accessibility & SEO)
          </label>
          <input
            type="text"
            value={altText || ""}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="e.g. Return on Equity DuPont equation diagram"
            className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
          />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
