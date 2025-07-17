'use server';
/**
 * @fileOverview AI-powered summary of each audit section, generated from the external webpage analysis.
 *
 * - summarizeAuditReport - A function that handles the audit report summarization process.
 * - SummarizeAuditReportInput - The input type for the summarizeAuditReport function.
 * - SummarizeAuditReportOutput - The return type for the summarizeAuditReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAuditReportInputSchema = z.object({
  report: z
    .string()
    .describe('The full text of the audit report to be summarized.'),
  section: z.string().describe('The section of the audit report to summarize.'),
});
export type SummarizeAuditReportInput = z.infer<typeof SummarizeAuditReportInputSchema>;

const SummarizeAuditReportOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the audit report section.'),
});
export type SummarizeAuditReportOutput = z.infer<typeof SummarizeAuditReportOutputSchema>;

export async function summarizeAuditReport(input: SummarizeAuditReportInput): Promise<SummarizeAuditReportOutput> {
  return summarizeAuditReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAuditReportPrompt',
  input: {schema: SummarizeAuditReportInputSchema},
  output: {schema: SummarizeAuditReportOutputSchema},
  prompt: `You are an expert web performance analyst.
  Your goal is to provide a concise summary of a specific section of a website audit report.

  Report Section Title: {{{section}}}
  Report Section Content: {{{report}}}

  Please provide a summary of the key findings and recommendations from the provided content.
  The summary should be no more than three sentences.`,
});

const summarizeAuditReportFlow = ai.defineFlow(
  {
    name: 'summarizeAuditReportFlow',
    inputSchema: SummarizeAuditReportInputSchema,
    outputSchema: SummarizeAuditReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
