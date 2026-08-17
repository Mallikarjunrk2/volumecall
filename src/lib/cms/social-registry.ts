export type SocialPlatform = "x" | "instagram" | "youtube";

export interface SocialEmbedOption {
  id: string;
  platform: SocialPlatform;
  type?: "post" | "reel" | "video";
  label: string;
  placeholder: string;
  description: string;
}

export const SOCIAL_EMBED_OPTIONS: SocialEmbedOption[] = [
  {
    id: "x-post",
    platform: "x",
    type: "post",
    label: "X / Twitter Post",
    placeholder: "https://x.com/username/status/123456789",
    description: "Embed an official post/tweet from X (formerly Twitter).",
  },
  {
    id: "instagram-post",
    platform: "instagram",
    type: "post",
    label: "Instagram Post",
    placeholder: "https://www.instagram.com/p/ABC123xyz/",
    description: "Embed an Instagram image or carousel post.",
  },
  {
    id: "instagram-reel",
    platform: "instagram",
    type: "reel",
    label: "Instagram Reel",
    placeholder: "https://www.instagram.com/reel/ABC123xyz/",
    description: "Embed an Instagram vertical video reel.",
  },
  {
    id: "youtube-video",
    platform: "youtube",
    type: "video",
    label: "YouTube Video",
    placeholder: "https://www.youtube.com/watch?v=ABC123xyz or https://youtu.be/...",
    description: "Embed a YouTube standard video or YouTube Short.",
  },
];

export interface ParsedSocialEmbed {
  valid: boolean;
  platform: SocialPlatform;
  type?: "post" | "reel" | "video";
  normalizedUrl: string;
  embedId: string;
  embedUrl?: string;
  authorOrUser?: string;
}

/**
 * Validates and parses a YouTube URL.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function parseYouTubeUrl(rawUrl: string): ParsedSocialEmbed | null {
  try {
    const url = new URL(rawUrl.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname !== "youtube.com" && hostname !== "youtu.be") {
      return null;
    }

    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.replace(/^\//, "").split("/")[0];
    } else if (url.pathname.startsWith("/watch")) {
      videoId = url.searchParams.get("v") || "";
    } else if (url.pathname.startsWith("/shorts/")) {
      videoId = url.pathname.replace(/^\/shorts\//, "").split("/")[0];
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.replace(/^\/embed\//, "").split("/")[0];
    }

    // Clean video ID (standard YouTube IDs are 11 chars base64url: [a-zA-Z0-9_-]{11})
    videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);

    if (!videoId) return null;

    return {
      valid: true,
      platform: "youtube",
      type: "video",
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedId: videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    };
  } catch {
    return null;
  }
}

/**
 * Validates and parses an X / Twitter Post URL.
 * Supports:
 * - https://x.com/username/status/POST_ID
 * - https://twitter.com/username/status/POST_ID
 */
export function parseXPostUrl(rawUrl: string): ParsedSocialEmbed | null {
  try {
    const url = new URL(rawUrl.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname !== "x.com" && hostname !== "twitter.com") {
      return null;
    }

    // Pattern: /{username}/status/{postId}
    const match = url.pathname.match(/^\/([a-zA-Z0-9_]{1,30})\/status\/([0-9]{1,30})/);
    if (!match) return null;

    const username = match[1];
    const postId = match[2];

    return {
      valid: true,
      platform: "x",
      type: "post",
      normalizedUrl: `https://x.com/${username}/status/${postId}`,
      embedId: postId,
      authorOrUser: username,
    };
  } catch {
    return null;
  }
}

/**
 * Validates and parses an Instagram Post or Reel URL.
 * Supports:
 * - https://www.instagram.com/p/CODE/
 * - https://www.instagram.com/reel/CODE/
 * - https://instagram.com/p/CODE/
 * - https://instagram.com/reel/CODE/
 */
export function parseInstagramUrl(rawUrl: string, requestedType?: "post" | "reel"): ParsedSocialEmbed | null {
  try {
    const url = new URL(rawUrl.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname !== "instagram.com") {
      return null;
    }

    const isReel = url.pathname.startsWith("/reel/") || requestedType === "reel";
    const match = url.pathname.match(/^\/(?:p|reel)\/([a-zA-Z0-9_-]{3,40})/);
    if (!match) return null;

    const code = match[1];
    const effectiveType = isReel ? "reel" : "post";
    const pathPrefix = isReel ? "reel" : "p";

    return {
      valid: true,
      platform: "instagram",
      type: effectiveType,
      normalizedUrl: `https://www.instagram.com/${pathPrefix}/${code}/`,
      embedId: code,
      embedUrl: `https://www.instagram.com/${pathPrefix}/${code}/embed`,
    };
  } catch {
    return null;
  }
}

/**
 * Unified parser and validator for any social media embed directive.
 */
export function validateSocialEmbed(
  platform: string,
  url: string,
  type?: string
): ParsedSocialEmbed | null {
  const cleanPlatform = (platform || "").toLowerCase().trim();

  if (cleanPlatform === "youtube") {
    return parseYouTubeUrl(url);
  }

  if (cleanPlatform === "x" || cleanPlatform === "twitter") {
    return parseXPostUrl(url);
  }

  if (cleanPlatform === "instagram") {
    const cleanType = type === "reel" ? "reel" : type === "post" ? "post" : undefined;
    return parseInstagramUrl(url, cleanType);
  }

  return null;
}
