import "server-only";
import { getSystemPrompt, getUserPrompt } from "./prompts";
import { ComparisonAnalysisSchema, ComparisonAnalysis } from "./schemas";

export class GroqError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "GroqError";
  }
}

/**
 * Generates an AI comparison analysis from Groq completions API.
 */
export async function generateAIComparison(comparisonData: unknown): Promise<ComparisonAnalysis> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;

  if (!apiKey) {
    throw new GroqError("GROQ_API_KEY is missing in the environment configuration.", 500, "MISSING_KEY");
  }
  if (!model) {
    throw new GroqError("GROQ_MODEL is missing in the environment configuration.", 500, "MISSING_MODEL");
  }

  const systemPrompt = getSystemPrompt();
  const userPrompt = getUserPrompt(comparisonData);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
      // Do not cache AI requests; they are dynamic comparisons
      cache: "no-store",
    });

    if (response.status === 429) {
      throw new GroqError("Groq API rate limit reached. Please try again in a few moments.", 429, "RATE_LIMIT");
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new GroqError(`Groq completions error: ${response.statusText}. ${errText}`, response.status, "API_ERROR");
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;

    if (!content) {
      throw new GroqError("Invalid API response format: Missing message content.", 500, "INVALID_RESPONSE");
    }

    // Parse string content to JSON
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      console.error("Failed to parse Groq response as JSON:", content);
      throw new GroqError("Failed to parse AI response as valid JSON.", 500, "JSON_PARSE_ERROR");
    }

    // Validate using Zod schema
    const validated = ComparisonAnalysisSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error("Zod schema validation failed on Groq output:", validated.error.format());
      throw new GroqError("AI output did not match expected structured layout.", 500, "VALIDATION_ERROR");
    }

    return validated.data;
  } catch (error) {
    if (error instanceof GroqError) {
      throw error;
    }
    console.error("Network error during Groq completion call:", error);
    throw new GroqError("Network error connecting to Groq AI service.", 500, "NETWORK_FAILURE");
  }
}
