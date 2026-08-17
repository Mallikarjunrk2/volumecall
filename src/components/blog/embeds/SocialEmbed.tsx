"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { validateSocialEmbed } from "@/lib/cms/social-registry";
import { ExternalLink, Play, AlertCircle } from "lucide-react";

interface SocialEmbedProps {
  platform: string;
  url: string;
  type?: string;
}

export function SocialEmbed({ platform, url, type }: SocialEmbedProps) {
  const parsed = validateSocialEmbed(platform, url, type);
  const twitterContainerRef = useRef<HTMLDivElement>(null);
  const instagramContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic script loader for X/Twitter widgets
  useEffect(() => {
    if (!parsed || parsed.platform !== "x") return;

    // Load Twitter widgets.js once
    const win = window as unknown as { twttr?: { widgets?: { load?: (el?: HTMLElement | null) => void } } };
    if (win.twttr?.widgets?.load) {
      win.twttr.widgets.load(twitterContainerRef.current);
    } else {
      const scriptId = "twitter-widgets-js";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        script.onload = () => {
          if (win.twttr?.widgets?.load) {
            win.twttr.widgets.load(twitterContainerRef.current);
          }
        };
        document.body.appendChild(script);
      }
    }
  }, [parsed]);

  // Dynamic script loader for Instagram embeds
  useEffect(() => {
    if (!parsed || parsed.platform !== "instagram") return;

    const win = window as unknown as { instgrm?: { Embeds?: { process?: () => void } } };
    if (win.instgrm?.Embeds?.process) {
      win.instgrm.Embeds.process();
    } else {
      const scriptId = "instagram-embed-js";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
          if (win.instgrm?.Embeds?.process) {
            win.instgrm.Embeds.process();
          }
        };
        document.body.appendChild(script);
      }
    }
  }, [parsed]);

  if (!parsed || !parsed.valid) {
    return (
      <div className="my-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-[var(--text-secondary)] flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">Unable to embed content from: {url}</span>
        </div>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-[var(--accent-teal)] font-semibold hover:underline shrink-0"
        >
          <span>View Link</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  // 1. YouTube Video & Shorts Embed
  if (parsed.platform === "youtube") {
    return (
      <div className="my-6 space-y-2">
        <div className="aspect-16/9 w-full rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-black shadow-md">
          <iframe
            src={parsed.embedUrl}
            title="YouTube video player"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] px-1">
          <span className="flex items-center space-x-1">
            <Play className="w-3 h-3 text-red-500" />
            <span>YouTube {parsed.type === "video" ? "Video" : "Short"}</span>
          </span>
          <Link
            href={parsed.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-teal)] hover:underline inline-flex items-center space-x-0.5"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 2. X / Twitter Post Embed
  if (parsed.platform === "x") {
    return (
      <div className="my-6 flex flex-col items-center">
        <div ref={twitterContainerRef} className="w-full max-w-[550px] min-h-[150px] flex justify-center">
          <blockquote className="twitter-tweet" data-dnt="true" data-theme="dark">
            <a href={parsed.normalizedUrl}>Loading X post...</a>
          </blockquote>
        </div>
        <div className="w-full max-w-[550px] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 px-1">
          <span>X / Twitter</span>
          <Link
            href={parsed.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-teal)] hover:underline inline-flex items-center space-x-0.5"
          >
            <span>View on X</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Instagram Post & Reel Embed
  if (parsed.platform === "instagram") {
    return (
      <div className="my-6 flex flex-col items-center">
        <div ref={instagramContainerRef} className="w-full max-w-[540px] flex justify-center overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <iframe
            src={`${parsed.normalizedUrl}embed`}
            className="w-full min-h-[480px] max-h-[600px] border-0 rounded-lg"
            allowFullScreen
            loading="lazy"
            title={`Instagram ${parsed.type === "reel" ? "Reel" : "Post"}`}
          />
        </div>
        <div className="w-full max-w-[540px] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 px-1">
          <span>Instagram {parsed.type === "reel" ? "Reel" : "Post"}</span>
          <Link
            href={parsed.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-teal)] hover:underline inline-flex items-center space-x-0.5"
          >
            <span>View on Instagram</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export default SocialEmbed;
