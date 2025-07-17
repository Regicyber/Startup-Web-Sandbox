"use client";

import { useState } from "react";
import { type AuditCategory } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { generateSummary } from "@/app/actions";
import { Sparkles, Loader2, Rocket, ClipboardList } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AuditCategoryItemProps {
  category: AuditCategory;
}

export default function AuditCategoryItem({ category }: AuditCategoryItemProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummary(null);
    try {
      const result = await generateSummary({
        report: category.rawReport,
        section: category.title,
      });
      setSummary(result.summary);
    } catch (error) {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const opportunities = category.details.filter(d => d.type === 'opportunity');
  const diagnostics = category.details.filter(d => d.type === 'diagnostic');

  return (
    <AccordionItem value={category.id}>
      <AccordionTrigger className="text-lg font-medium hover:no-underline px-4">
        <div className="flex items-center gap-3">
          <category.Icon className="h-6 w-6" />
          <span>{category.title}</span>
          <Badge variant={category.score >= 90 ? 'default' : category.score >= 50 ? 'secondary' : 'destructive'} 
                 className={cn(
                    {'bg-green-500 hover:bg-green-500/90': category.score >= 90},
                    {'bg-yellow-500 hover:bg-yellow-500/90 text-primary-foreground': category.score >= 50 && category.score < 90},
                    {'bg-red-500 hover:bg-red-500/90': category.score < 50}
                 )}>
            {category.score}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary && <p className="text-foreground/90">{summary}</p>}
              {isSummaryLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating simplified report...</span>
                </div>
              )}
              {!summary && !isSummaryLoading && (
                 <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Summary
                </Button>
              )}
            </CardContent>
          </Card>

          {opportunities.length > 0 && (
            <div>
              <h4 className="font-semibold text-md mb-2 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-accent" />
                Opportunities
              </h4>
              <p className="text-sm text-muted-foreground mb-4">These suggestions can help your page load faster. They don't directly affect the Performance score.</p>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Potential Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {diagnostics.length > 0 && (
            <div>
              <h4 className="font-semibold text-md mb-2 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                Diagnostics
              </h4>
              <p className="text-sm text-muted-foreground mb-4">More information about the performance of your application. These are not opportunities for direct improvement.</p>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diagnostics.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
