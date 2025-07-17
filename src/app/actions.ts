"use server";

import { generateFullReport } from "@/ai/flows/generate-full-report";
import { summarizeAuditReport } from "@/ai/flows/summarize-audit-report";
import { z } from "zod";

const summaryInputSchema = z.object({
  report: z.string(),
  section: z.string(),
});

export async function generateSummary(input: { report: string, section: string }) {
  const validatedInput = summaryInputSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error("Invalid input for summary generation.");
  }
  
  try {
    const result = await summarizeAuditReport(validatedInput.data);
    if (!result || !result.summary) {
      // This handles cases where the AI returns a valid but empty response
      throw new Error("AI returned an empty summary.");
    }
    return result;
  } catch (error) {
    console.error("Error generating summary:", error);
    // Ensure a consistent error response format
    return { summary: "Could not generate summary at this time." };
  }
}

const fullReportInputSchema = z.object({
  performanceReport: z.string(),
  accessibilityReport: z.string(),
  bestPracticesReport: z.string(),
  seoReport: z.string(),
});

export async function getFullReport(input: {
  performanceReport: string;
  accessibilityReport: string;
  bestPracticesReport: string;
  seoReport: string;
}) {
  const validatedInput = fullReportInputSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error("Invalid input for full report generation.");
  }
  return await generateFullReport(validatedInput.data);
}
