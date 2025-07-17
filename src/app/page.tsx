"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AuditReport from '@/components/audit-report';
import { type AuditData } from '@/lib/types';
import { getMockAuditData } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, BarChart } from 'lucide-react';

const FormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

type FormValues = z.infer<typeof FormSchema>;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setLoading(true);
    setAuditData(null);

    // Simulate API call and analysis
    setTimeout(() => {
      try {
        const mockData = getMockAuditData(data.url);
        setAuditData(mockData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not generate the audit report. Please try again.",
        });
        setAuditData(null);
      } finally {
        setLoading(false);
      }
    }, 2500);
  };

  return (
    <>
      <header className="no-print py-4 px-4 md:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold text-foreground">Startup Web Sandbox</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card className="max-w-3xl mx-auto no-print">
          <CardHeader>
            <CardTitle className="text-2xl">Website/App Audit</CardTitle>
            <CardDescription>Enter a URL to analyze its performance, accessibility, SEO, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-2">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="https://example.com" {...field} className="pl-10" disabled={loading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Running Audits...</h2>
              <p className="text-muted-foreground max-w-md">
                Please wait while we analyze your page. This might take a moment.
              </p>
            </div>
          )}

          {auditData && (
            <div className="print-report">
              <AuditReport data={auditData} />
            </div>
          )}
        </div>
      </main>

      <footer className="no-print py-4 px-4 md:px-8 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Startup Web Sandbox. All rights reserved.</p>
      </footer>
    </>
  );
}
