"use server";

import { summarizeAuditReport } from "@/ai/flows/summarize-audit-report";
import { z } from "zod";

const inputSchema = z.object({
  report: z.string(),
  section: z.string(),
});

export async function generateSummary(input: { report: string, section: string }) {
  const validatedInput = inputSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error("Invalid input for summary generation.");
  }
  
  try {
    const result = await summarizeAuditReport(validatedInput.data);
    return result;
  } catch (error) {
    console.error("Error generating summary:", error);
    return { summary: "Could not generate summary at this time." };
  }
}
