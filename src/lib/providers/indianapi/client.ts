import { IndianApiError, IndianApiErrorCode } from "./errors";
import { z } from "zod";

const BASE_URL = "https://stock.indianapi.in";

/**
 * Custom fetch client that handles authentication and secure logging.
 */
export async function fetchIndianApi<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.INDIAN_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new IndianApiError(
      "IndianAPI key is missing or not configured in environment.",
      401,
      "INVALID_KEY"
    );
  }

  const baseUrl = endpoint.startsWith("/logo") ? "https://analyst.indianapi.in" : BASE_URL;
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set("X-Api-Key", apiKey);
  headers.set("Accept", "application/json");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      throw new IndianApiError("Invalid or unauthorized API key.", response.status, "INVALID_KEY");
    }

    if (response.status === 429) {
      throw new IndianApiError("IndianAPI request limit exceeded.", 429, "RATE_LIMITED");
    }

    if (response.status === 404) {
      throw new IndianApiError("Request resource not found.", 404, "NOT_FOUND");
    }

    if (!response.ok) {
      throw new IndianApiError(
        `API returned error status: ${response.status}`,
        response.status,
        "SERVER_ERROR"
      );
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      return {} as T;
    }

    let rawData: unknown;
    try {
      rawData = JSON.parse(text);
    } catch {
      throw new IndianApiError("Response is not valid JSON.", response.status, "SERVER_ERROR");
    }

    const symbolMatch = endpoint.match(/[?&](stock_name|name)=([^&]+)/);
    const symbol = symbolMatch ? decodeURIComponent(symbolMatch[2]) : "UNKNOWN";

    try {
      return schema.parse(rawData);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        console.error(`\n[IndianAPI]`);
        console.error(`symbol: ${symbol}`);
        console.error(`endpoint: ${endpoint.split("?")[0]}`);
        parseError.issues.forEach((issue) => {
          const pathStr = issue.path.join(".");
          let receivedVal: unknown = rawData;
          for (const segment of issue.path) {
            if (receivedVal && typeof receivedVal === "object") {
              receivedVal = (receivedVal as Record<string, unknown>)[segment.toString()];
            } else {
              receivedVal = undefined;
              break;
            }
          }
          console.error(`path: ${pathStr}`);
          console.error(`expected: ${issue.code === "invalid_type" ? (issue as { expected?: string }).expected : "valid format"}`);
          console.error(`received: ${receivedVal !== undefined ? JSON.stringify(receivedVal) : "undefined"} (${typeof receivedVal})`);
        });
        console.error("");
      } else {
        console.error("[IndianAPI client] Schema validation failed:", parseError);
      }
      throw new IndianApiError(
        "Response payload did not match expected schema format.",
        200,
        "PARSE_ERROR"
      );
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof IndianApiError) {
      throw error;
    }

    // Securely log connection error without leaking credentials
    const isAbort = (error as Error).name === "AbortError";
    console.error(
      `[IndianAPI client] Error fetching ${endpoint.split("?")[0]}:`,
      isAbort ? "Request timed out" : (error as Error).message
    );

    const code: IndianApiErrorCode = isAbort ? "TIMEOUT" : "NETWORK_FAILURE";
    throw new IndianApiError(
      isAbort ? "Request connection timed out." : "Network connection failed.",
      500,
      code
    );
  }
}
