"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AuditData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Download, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import ScoreBadge from "./score-badge";
import AuditCategoryItem from "./audit-category";

interface AuditReportProps {
  data: AuditData;
}

export default function AuditReport({ data }: AuditReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const element = reportRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (document) => {
          // On the cloned document, we can add styles to prepare it for printing
          const clonedElement = document.querySelector('.print-area');
          if (clonedElement) {
            // Example of forcing a white background for consistent PDF output
             (clonedElement as HTMLElement).style.backgroundColor = 'white';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // The total height of the image might be larger than one page.
      // We need to add pages and draw parts of the image on each.
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight / ratio;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight / ratio;
      }
      
      pdf.save(`audit-report-${data.url.replace(/https?:\/\//, '')}.pdf`);

    } catch(error) {
      console.error("Failed to download PDF", error);
    } finally {
      setIsDownloading(false);
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
                Downloading...
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
            <Accordion type="single" collapsible className="w-full">
              {data.categories.map((category) => (
                <AuditCategoryItem key={category.id} category={category} />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
