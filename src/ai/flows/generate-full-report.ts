'use server';
/**
 * @fileOverview A comprehensive AI analysis of a full website audit.
 *
 * - generateFullReport - A function that creates a high-level summary and action plan from multiple audit reports.
 * - GenerateFullReportInput - The input type for the generateFullReport function.
 * - GenerateFullReportOutput - The return type for the generateFullReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFullReportInputSchema = z.object({
  performanceReport: z.string().describe('The raw text of the Performance audit report.'),
  accessibilityReport: z.string().describe('The raw text of the Accessibility audit report.'),
  bestPracticesReport: z.string().describe('The raw text of the Best Practices audit report.'),
  seoReport: z.string().describe('The raw text of the SEO audit report.'),
});
export type GenerateFullReportInput = z.infer<typeof GenerateFullReportInputSchema>;

const GenerateFullReportOutputSchema = z.object({
  overallSummary: z.string().describe("A high-level, paragraph-long summary of the website's overall health, synthesizing findings from all categories."),
  keyStrengths: z.array(z.string()).describe("A bulleted list of 3-5 key areas where the website is performing well."),
  areasForImprovement: z.array(z.string()).describe("A bulleted list of 3-5 of the most critical issues found across all reports."),
  actionPlan: z.array(z.object({
    priority: z.enum(['High', 'Medium', 'Low']).describe('The priority of the action item.'),
    task: z.string().describe('A clear, concise description of the task to be performed.'),
    justification: z.string().describe('A brief explanation of why this task is important and what it will improve.'),
  })).describe('A prioritized list of actionable steps to address the most critical issues.'),
});
export type GenerateFullReportOutput = z.infer<typeof GenerateFullReportOutputSchema>;

export async function generateFullReport(input: GenerateFullReportInput): Promise<GenerateFullReportOutput> {
  return generateFullReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFullReportPrompt',
  input: {schema: GenerateFullReportInputSchema},
  output: {schema: GenerateFullReportOutputSchema},
  prompt: `You are an expert web development consultant. Your task is to analyze four separate audit reports (Performance, Accessibility, Best Practices, and SEO) and provide a single, consolidated, high-level analysis.

Here are the individual reports:

# Performance Report
{{{performanceReport}}}

# Accessibility Report
{{{accessibilityReport}}}

# Best Practices Report
{{{bestPracticesReport}}}

# SEO Report
{{{seoReport}}}

Based on all the provided information, generate a comprehensive analysis.
- The overall summary should be a holistic overview, not just a list of the four scores.
- Identify the most critical issues and synthesize them into a clear list of areas for improvement.
- Create a practical, prioritized action plan that a developer can follow. The justification for each action item is very important.
- Be encouraging but direct. The goal is to help the user improve their site.
`,
});

const generateFullReportFlow = ai.defineFlow(
  {
    name: 'generateFullReportFlow',
    inputSchema: GenerateFullReportInputSchema,
    outputSchema: GenerateFullReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
