"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AuditData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Download, Calendar, Link as LinkIcon, Loader2, BarChart3, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import ScoreBadge from "./score-badge";
import AuditCategoryItem from "./audit-category";

interface AuditReportProps {
  data: AuditData;
}

export default function AuditReport({ data }: AuditReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);
  const allCategoryIds = data.categories.map(c => c.id);

  const handleDownloadPdf = async () => {
    const element = reportRef.current;
    if (!element) return;

    setIsDownloading(true);
    
    // 1. Expand all accordions and trigger summary generation
    setIsPreparing(true);
    setExpandedAccordions(allCategoryIds);

    // Give components time to re-render with all content visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Trigger summary generation on all items
    const summaryButtons = element.querySelectorAll<HTMLButtonElement>('[data-summary-button="true"]');
    summaryButtons.forEach(button => button.click());

    // Wait for summaries to be generated (give it a few seconds)
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsPreparing(false);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 page size in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const canvasAspectRatio = imgWidth / imgHeight;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalImgWidth, finalImgHeight;

      // Fit image to page width
      finalImgWidth = pdfWidth;
      finalImgHeight = finalImgWidth / canvasAspectRatio;

      let position = 0;
      let pageCount = 1;
      const totalPages = Math.ceil(finalImgHeight / pdfHeight);

      pdf.addImage(imgData, 'PNG', 0, position, finalImgWidth, finalImgHeight, undefined, 'FAST');
      let remainingHeight = finalImgHeight - pdfHeight;

      while (remainingHeight > 0) {
        pageCount++;
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, finalImgWidth, finalImgHeight, undefined, 'FAST');
        remainingHeight -= pdfHeight;
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
    <div className="space-y-8">
      <Card className="no-print">
        <CardHeader className="flex-row items-center justify-between">
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
                More Analysis
              </CardTitle>
              <CardDescription>
                Run a live performance analysis powered by Google PageSpeed Insights.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="ml-4 flex-shrink-0">
                <a href={pageSpeedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open PageSpeed
                </a>
            </Button>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">
                Click the button above to open a real-time report from Google. This provides the most up-to-date and comprehensive analysis, including a live performance trace.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
