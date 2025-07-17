"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AuditData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Download, Calendar, Link as LinkIcon, Loader2, BarChart3, ExternalLink, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import ScoreBadge from "./score-badge";
import AuditCategoryItem from "./audit-category";
import { getFullReport } from "@/app/actions";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "./ui/alert-dialog";

interface AuditReportProps {
  data: AuditData;
}

export default function AuditReport({ data }: AuditReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);
  const allCategoryIds = data.categories.map(c => c.id);

  const [isAiReportLoading, setIsAiReportLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);

  const handleGenerateAiReport = async () => {
    setIsAiReportLoading(true);
    setAiReport(null);
    setIsAiReportOpen(true);
    try {
      const reports = data.categories.reduce((acc, category) => {
        acc[`${category.id}Report`] = category.rawReport;
        return acc;
      }, {} as any);
      const result = await getFullReport(reports);
      setAiReport(result);
    } catch (error) {
      console.error(error);
      setAiReport({ error: "Failed to generate the AI report. Please try again later." });
    } finally {
      setIsAiReportLoading(false);
    }
  };


  const handleDownloadPdf = async () => {
    const element = reportRef.current;
    if (!element) return;

    setIsDownloading(true);
    setIsPreparing(true);
    
    // 1. Expand all accordions
    setExpandedAccordions(allCategoryIds);

    // Give components time to re-render with all content visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 2. Trigger all summary generations
    const summaryButtons = Array.from(element.querySelectorAll<HTMLButtonElement>('[data-summary-button="true"]'));
    const summaryPromises = summaryButtons.map(button => {
      button.click();
      // This is a trick: we can't easily await the state update from the click,
      // so we'll check for the button to be disabled (which happens on load)
      // and then re-enabled (or removed) when loading is finished.
      // A more robust way would be to lift state up, but this avoids major refactoring.
      return new Promise<void>(resolve => {
        const interval = setInterval(() => {
          // The button is removed from the DOM once the summary is loaded
          if (!document.body.contains(button)) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    });

    // 3. Wait for all summaries to be generated.
    await Promise.all(summaryPromises);
    
    // Short extra delay for final DOM render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsPreparing(false);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      // A4 page size in mm: 210 x 297
      const pageHeight = 297;
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4', true);
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      
      pdf.save(`audit-report-${data.url.replace(/https?:\/\//, '')}.pdf`, { returnPromise: true });

    } catch(error) {
      console.error("Failed to download PDF", error);
    } finally {
      setIsDownloading(false);
      setExpandedAccordions([]); // Collapse accordions after download
    }
  };

  const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(data.url)}`;

  return (
    <>
      <AlertDialog open={isAiReportOpen} onOpenChange={setIsAiReportOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Comprehensive AI Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              An AI-powered analysis of the full audit report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            {isAiReportLoading && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Analyzing all reports, this may take a moment...</p>
              </div>
            )}
            {aiReport?.error && (
              <p className="text-destructive">{aiReport.error}</p>
            )}
            {aiReport && !aiReport.error && (
              <div className="space-y-6 text-sm">
                <div>
                  <h3 className="font-bold text-lg mb-2">Overall Summary</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{aiReport.overallSummary}</p>
                </div>
                 <div>
                  <h3 className="font-bold text-lg mb-2">Key Strengths</h3>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {aiReport.keyStrengths.map((strength: string, index: number) => <li key={index}>{strength}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Areas for Improvement</h3>
                   <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {aiReport.areasForImprovement.map((item: string, index: number) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Prioritized Action Plan</h3>
                   <ul className="list-decimal pl-5 space-y-2 text-muted-foreground">
                     {aiReport.actionPlan.map((action: { priority: string; task: string, justification: string }, index: number) => (
                      <li key={index} className="mb-2">
                        <strong className="text-foreground">{action.task}</strong> (Priority: {action.priority})
                        <p className="text-xs pl-1">{action.justification}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <Card className="no-print">
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Audit Report</CardTitle>
            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                <a href={data.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {data.url}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(data.timestamp), "PPP p")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateAiReport} disabled={isAiReportLoading}>
              {isAiReportLoading ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate AI Report
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPreparing ? 'Preparing...' : 'Downloading...'}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <div ref={reportRef} className="print-area space-y-8 bg-background p-4 sm:p-8 rounded-lg shadow-lg">
        <Card>
          <CardHeader>
              <CardTitle className="text-3xl font-bold">Audit Summary</CardTitle>
              <CardDescription>
                Detailed analysis for <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{data.url}</a>
              </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {data.categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-center items-center gap-2">
                       <category.Icon className="h-6 w-6 text-primary" />
                       <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-2">
                    <ScoreBadge score={category.score} />
                    <CardDescription>{category.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
            <CardDescription>
              Explore detailed metrics, opportunities for improvement, and diagnostic information for each category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion 
              type="multiple" 
              className="w-full"
              value={expandedAccordions}
              onValueChange={setExpandedAccordions}
            >
              {data.categories.map((category) => (
                <AuditCategoryItem key={category.id} category={category} />
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Live Analysis
              </CardTitle>
              <CardDescription>
                Run a live performance analysis powered by Google PageSpeed Insights for the most up-to-date data.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="ml-4 flex-shrink-0">
                <a href={pageSpeedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Live Report
                </a>
            </Button>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">
                Click the button to open a real-time report from Google. This provides the most up-to-date and comprehensive analysis, including a live performance trace.
             </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
