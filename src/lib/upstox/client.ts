import "server-only";
import { z } from "zod";

const UPSTOX_BASE_URL = "https://api.upstox.com";

export class UpstoxError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "UpstoxError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Fetch data from Upstox API and validate using Zod.
 */
export async function fetchUpstox<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options: RequestInit = {}
): Promise<T> {
  const token = process.env.UPSTOX_ACCESS_TOKEN;
  if (!token) {
    throw new UpstoxError(
      "Upstox Access Token is missing. Please set UPSTOX_ACCESS_TOKEN in .env.local",
      500,
      "MISSING_TOKEN"
    );
  }

  // Handle leading slashes in endpoint
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${UPSTOX_BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    console.error(`Upstox fetch error for ${url}:`, err);
    throw new UpstoxError(
      "Network error connecting to Upstox.",
      500,
      "NETWORK_FAILURE"
    );
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      errorDetail = await response.text();
    } catch {
      // ignore
    }
    console.error(`Upstox API Error: ${response.status} ${response.statusText} - ${errorDetail}`);
    if (response.status === 401) {
      throw new UpstoxError(
        "Upstox token is expired or unauthorized.",
        401,
        "UNAUTHORIZED"
      );
    }
    if (response.status === 429) {
      throw new UpstoxError(
        "Rate limit exceeded on Upstox API.",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }
    throw new UpstoxError(
      `Upstox API returned error status: ${response.status}`,
      response.status,
      "API_ERROR"
    );
  }

  const text = await response.text();
  if (!text || text.trim() === "") {
    return {} as T;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error(`Failed to parse Upstox JSON response:`, err);
    throw new UpstoxError(
      "Upstox returned a malformed response.",
      502,
      "MALFORMED_RESPONSE"
    );
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    console.error("Zod Validation Failure for Upstox response:", result.error.format());
    throw new UpstoxError(
      "Validation failed for Upstox API response.",
      502,
      "VALIDATION_FAILURE"
    );
  }

  return result.data;
}
