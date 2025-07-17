"use client";

import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AuditData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Download, Calendar, Link as LinkIcon, Loader2, BarChart3 } from 'lucide-react';
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trigger summary generation on all items
    const summaryButtons = element.querySelectorAll<HTMLButtonElement>('[data-summary-button="true"]');
    summaryButtons.forEach(button => button.click());

    // Wait for summaries to be generated (give it a few seconds)
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (document) => {
          const clonedElement = document.querySelector('.print-area');
          if (clonedElement) {
             (clonedElement as HTMLElement).style.backgroundColor = 'white';
             // You can add more print-specific styles here if needed
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const totalPages = Math.ceil(imgHeight / (pdfHeight / ratio));

      for (let i = 0; i < totalPages; i++) {
        const yPos = -(i * pdfHeight / ratio);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, yPos, imgWidth * ratio, imgHeight * ratio);
      }
      
      pdf.save(`audit-report-${data.url.replace(/https?:\/\//, '')}.pdf`, { returnPromise: true });

    } catch(error) {
      console.error("Failed to download PDF", error);
    } finally {
      setIsDownloading(false);
      setIsPreparing(false);
      setExpandedAccordions([]); // Collapse accordions after download
    }
  };

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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Live Analysis
            </CardTitle>
            <CardDescription>
              A live performance analysis powered by Google PageSpeed Insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-video rounded-lg overflow-hidden border">
              <iframe
                id="pagespeed-iframe"
                src={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(data.url)}`}
                className="w-full h-full border-0"
                title="PageSpeed Insights"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
