"use client";

import { type AuditData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Printer, Calendar, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import ScoreBadge from "./score-badge";
import AuditCategoryItem from "./audit-category";

interface AuditReportProps {
  data: AuditData;
}

export default function AuditReport({ data }: AuditReportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <Card>
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
          <Button variant="outline" onClick={handlePrint} className="no-print">
            <Printer className="mr-2 h-4 w-4" />
            Download Report
          </Button>
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
  );
}
