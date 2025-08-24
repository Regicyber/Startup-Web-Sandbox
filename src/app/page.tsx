"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const scanDescriptions: Record<string, string> = {
  security: "Checks your website for common vulnerabilities using open-source tools. Helps identify potential security risks and weaknesses.",
  brokenLinks: "Scans your website for broken or dead links, ensuring all your pages and resources are accessible to users and search engines.",
  dns: "Displays technical details about your domain, such as DNS records and registrar info, to help you verify your domain setup.",
  social: "Checks your website for social media meta tags (Open Graph, Twitter Cards, etc.) to ensure your site previews correctly when shared.",
  ssl: "Verifies your site's SSL certificate validity, expiration, and configuration to ensure secure connections for your users.",
  observatory: "Provides a summary of your site's security headers and best practices, based on Mozilla's public Observatory tool.",
  dependency: "Scans your project's dependencies for known vulnerabilities using open source tools (e.g., npm audit).",
  headers: "Analyzes HTTP security headers for best practices and missing protections.",
  rateLimit: "Checks for basic rate limiting and DDoS protection measures.",
  auth: "Reviews authentication and authorization setup for common misconfigurations.",
  privacy: "Scans for privacy policy, cookie consent, and GDPR compliance indicators.",
  accessibility: "Runs automated accessibility checks to identify usability issues.",
  performance: "Performs basic load and performance tests to identify bottlenecks.",
  ports: "Checks for open ports and exposed network services.",
  secrets: "Scans for hardcoded secrets, API keys, or credentials in the codebase.",
  backup: "Validates backup and disaster recovery strategy documentation.",
};

function ScanAccordion({ label, description, children }: { label: string; description: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg mb-2 bg-white">
      <button
        type="button"
        className="flex justify-between items-center w-full px-4 py-3 text-left font-semibold focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-muted-foreground">
          {description}
          <div className="mt-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AuditReport from '@/components/audit-report';
import { type AuditData } from '@/lib/types';
import { getMockAuditData } from '@/lib/mock-data';
import { runSecurityScan } from '@/services/securityScan';
import { checkBrokenLinks } from '@/services/brokenLinkChecker';
import { getDomainDnsInfo } from '@/services/domainDnsInfo';
import { validateSocialMediaMetadata } from '@/services/socialMediaMetadata';
import { checkSslCertificate } from '@/services/sslCertificateCheck';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, BarChart } from 'lucide-react';

const FormSchema = z.object({
  url: z.string()
    .min(1, { message: "Please enter a URL." })
    .transform((url) => (url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`))
    .pipe(z.string().url({ message: "Please enter a valid URL." })),
  scans: z.array(z.string()).min(1, { message: "Select at least one scan." }),
});

type FormValues = z.infer<typeof FormSchema>;


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [scanResults, setScanResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const scanOptions = [
    { value: 'security', label: 'Security Scan & Vulnerability Check' },
    { value: 'brokenLinks', label: 'Broken Link Checker' },
    { value: 'dns', label: 'Domain & DNS Information' },
    { value: 'social', label: 'Social Media Metadata Validation' },
    { value: 'ssl', label: 'SSL Certificate Check' },
    { value: 'observatory', label: 'Mozilla Observatory Security Check' },
    { value: 'dependency', label: 'Dependency Vulnerability Scan' },
    { value: 'headers', label: 'HTTP Security Headers Analysis' },
    { value: 'rateLimit', label: 'Rate Limiting & DDoS Protection Check' },
    { value: 'auth', label: 'Authentication & Authorization Review' },
    { value: 'privacy', label: 'Data Privacy & GDPR Compliance' },
    { value: 'accessibility', label: 'Automated Accessibility Audit' },
    { value: 'performance', label: 'Performance & Load Testing' },
    { value: 'ports', label: 'Open Ports & Network Exposure Scan' },
    { value: 'secrets', label: 'Secrets & Key Exposure Scan' },
    { value: 'backup', label: 'Backup & Disaster Recovery Validation' },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "",
      scans: scanOptions.map(opt => opt.value), // default: all selected
    },
  });

  // Helper to add timeout to any promise
  function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))
    ]);
  }

  const runScan = async (scan: string, url: string) => {
    try {
      if (scan === 'security') {
        return await withTimeout(runSecurityScan(url), 8000, { error: 'Security scan timed out' });
      } else if (scan === 'brokenLinks') {
        return await withTimeout(checkBrokenLinks(url), 20000, { error: 'Broken link check timed out' });
      } else if (scan === 'dns') {
        const domain = url.replace(/^https?:\/\//, '').split('/')[0];
        return await withTimeout(getDomainDnsInfo(domain), 8000, { error: 'DNS info timed out' });
      } else if (scan === 'social') {
        return await withTimeout(validateSocialMediaMetadata(url), 8000, { error: 'Social metadata check timed out' });
      } else if (scan === 'ssl') {
        const domain = url.replace(/^https?:\/\//, '').split('/')[0];
        return await withTimeout(checkSslCertificate(domain), 8000, { error: 'SSL check timed out' });
      } else if (scan === 'observatory') {
        const resp = await withTimeout(
          fetch('/api/mozilla-observatory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          8000,
          null
        );
        if (!resp) return { error: 'Observatory scan timed out' };
        return await resp.json();
      } else if (scan === 'dependency') {
        const resp = await withTimeout(
          fetch('/api/dependency-vulnerability', { method: 'POST' }),
          15000,
          null
        );
        if (!resp) return { error: 'Dependency scan timed out' };
        return await resp.json();
      } else if (scan === 'headers') {
        const resp = await withTimeout(
          fetch('/api/http-headers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          8000,
          null
        );
        if (!resp) return { error: 'Headers scan timed out' };
        return await resp.json();
      } else if (scan === 'rateLimit') {
        const resp = await withTimeout(
          fetch('/api/rate-limit-ddos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          10000,
          null
        );
        if (!resp) return { error: 'Rate limit scan timed out' };
        return await resp.json();
      } else if (scan === 'auth') {
        const resp = await withTimeout(
          fetch('/api/auth-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          8000,
          null
        );
        if (!resp) return { error: 'Auth scan timed out' };
        return await resp.json();
      } else if (scan === 'privacy') {
        const resp = await withTimeout(
          fetch('/api/privacy-gdpr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          8000,
          null
        );
        if (!resp) return { error: 'Privacy scan timed out' };
        return await resp.json();
      } else if (scan === 'accessibility') {
        const resp = await withTimeout(
          fetch('/api/accessibility-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          8000,
          null
        );
        if (!resp) return { error: 'Accessibility scan timed out' };
        return await resp.json();
      } else if (scan === 'performance') {
        const resp = await withTimeout(
          fetch('/api/performance-load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }),
          8000,
          null
        );
        if (!resp) return { error: 'Performance scan timed out' };
        return await resp.json();
      } else if (scan === 'ports') {
        const domain = url.replace(/^https?:\/\//, '').split('/')[0];
        const resp = await withTimeout(
          fetch('/api/open-ports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain }),
          }),
          15000,
          null
        );
        if (!resp) return { error: 'Open ports scan timed out' };
        return await resp.json();
      } else if (scan === 'secrets') {
        const resp = await withTimeout(
          fetch('/api/secrets-scan', { method: 'POST' }),
          15000,
          null
        );
        if (!resp) return { error: 'Secrets scan timed out' };
        return await resp.json();
      } else if (scan === 'backup') {
        const resp = await withTimeout(
          fetch('/api/backup-disaster', { method: 'POST' }),
          8000,
          null
        );
        if (!resp) return { error: 'Backup scan timed out' };
        return await resp.json();
      }
    } catch (error: any) {
      return { error: error.message || 'Scan failed' };
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setAuditData(null);
    setScanResults({});

    // Run each scan independently and update results as they complete
    data.scans.forEach(async (scan) => {
      const result = await runScan(scan, data.url);
      setScanResults(prev => ({ ...prev, [scan]: result }));
    });

    // For now, keep mock auditData for compatibility
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
            <CardTitle className="text-2xl">Startup Web Sandbox</CardTitle>
            <CardDescription>
              <span className="block mb-2">Easily audit, secure, and test your website or web app before launch.</span>
              <span className="block">Enter your site URL, select the checks you want, and instantly get results for security, performance, accessibility, privacy, and more—all in one place.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start gap-2">
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
                    </div>
                    <div className="flex flex-row items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs px-3 py-1"
                        onClick={() => form.setValue('scans', scanOptions.map(opt => opt.value))}
                        disabled={loading}
                      >
                        Select All
                      </Button>
                      <span className="text-xs text-muted-foreground">Select which scans to run:</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="scans"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {scanOptions.map(opt => (
                              <label key={opt.value} className="flex items-center gap-2 cursor-pointer border rounded px-2 py-1 bg-white hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  value={opt.value}
                                  checked={field.value.includes(opt.value)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, opt.value]);
                                    } else {
                                      field.onChange(field.value.filter((v: string) => v !== opt.value));
                                    }
                                  }}
                                  disabled={loading}
                                />
                                <span className="text-xs">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
          </CardContent>
        </Card>

        <div className="mt-8">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Running Selected Scans...</h2>
                <p className="text-muted-foreground max-w-md">
                  Please wait while we analyze your page. This might take a moment.
                </p>
              </div>
            )}

            {/* Show scan results for selected scans */}
            {!loading && Object.keys(scanResults).length > 0 && (
              <div className="space-y-4">
                {scanOptions.map(opt => (
                  <ScanAccordion
                    key={opt.value}
                    label={opt.label}
                    description={scanDescriptions[opt.value]}
                  >
                    {opt.value === 'observatory' ? (
                      <div className="mt-2">
                        <Button
                          type="button"
                          onClick={() => {
                            const url = form.getValues('url');
                            const domain = url.replace(/^https?:\/\//, '').split('/')[0];
                            window.open(`https://observatory.mozilla.org/analyze/${domain}`, '_blank');
                          }}
                        >
                          Open Mozilla Observatory Security Check
                        </Button>
                      </div>
                    ) : (
                      scanResults[opt.value] && (
                        <Card className="border-primary mt-2">
                          <CardHeader>
                            <CardTitle>{opt.label}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {opt.value === 'dns' ? (
                              <div style={{ maxHeight: 240, overflow: 'auto', background: '#f9f9f9', borderRadius: 6, padding: 8 }}>
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{JSON.stringify(scanResults[opt.value], null, 2)}</pre>
                              </div>
                            ) : opt.value === 'social' ? (
                              <div className="text-xs text-muted-foreground">
                                <div>
                                  <strong>Open Graph Tags:</strong>
                                  {scanResults.social.openGraph && Object.keys(scanResults.social.openGraph).length > 0 ? (
                                    <ul className="ml-4">
                                      {Object.entries(scanResults.social.openGraph).map(([key, value]) => (
                                        <li key={key}><span className="font-mono">{key}</span>: {String(value)}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="ml-2">None found</span>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <strong>Twitter Card Tags:</strong>
                                  {scanResults.social.twitter && Object.keys(scanResults.social.twitter).length > 0 ? (
                                    <ul className="ml-4">
                                      {Object.entries(scanResults.social.twitter).map(([key, value]) => (
                                        <li key={key}><span className="font-mono">{key}</span>: {String(value)}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="ml-2">None found</span>
                                  )}
                                </div>
                                {scanResults.social.missing && scanResults.social.missing.length > 0 && (
                                  <div className="mt-2 text-red-500">
                                    <strong>Missing:</strong> {scanResults.social.missing.join(', ')}
                                  </div>
                                )}
                              </div>
                            ) : opt.value === 'secrets' ? (
                              <div style={{ maxHeight: 240, overflow: 'auto', background: '#f9f9f9', borderRadius: 6, padding: 8 }}>
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{JSON.stringify(scanResults[opt.value], null, 2)}</pre>
                              </div>
                            ) : opt.value === 'dependency' ? (
                              <div style={{ maxHeight: 240, overflow: 'auto', background: '#f9f9f9', borderRadius: 6, padding: 8 }}>
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{JSON.stringify(scanResults[opt.value], null, 2)}</pre>
                              </div>
                            ) : opt.value === 'ports' ? (
                              <>
                                <div className="mb-2 text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-1">
                                  <strong>Note:</strong> This feature requires <span className="font-bold">Nmap</span> to be installed on your server.<br />
                                  <a
                                    href="https://nmap.org/download.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-700"
                                  >
                                    Install Nmap
                                  </a>
                                </div>
                                <div style={{ maxHeight: 240, overflow: 'auto', background: '#f9f9f9', borderRadius: 6, padding: 8 }}>
                                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{JSON.stringify(scanResults[opt.value], null, 2)}</pre>
                                </div>
                              </>
                            ) : opt.value === 'security' ? (
                              <>
                                <div className="mb-2 text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-1">
                                  <strong>Note:</strong> For advanced vulnerability scanning, you can integrate <span className="font-bold">OWASP ZAP</span>.<br />
                                  <a
                                    href="https://www.zaproxy.org/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-700"
                                  >
                                    Install OWASP ZAP
                                  </a>
                                </div>
                                <pre className="text-xs text-muted-foreground">{JSON.stringify(scanResults[opt.value], null, 2)}</pre>
                              </>
                            ) : opt.value === 'accessibility' && scanResults[opt.value]?.error ? (
                              <div className="text-xs text-red-500">Accessibility scan error: {scanResults[opt.value].error}</div>
                            ) : opt.value === 'privacy' && scanResults[opt.value]?.error ? (
                              <div className="text-xs text-red-500">Privacy scan error: {scanResults[opt.value].error}</div>
                            ) : (
                              <pre className="text-xs text-muted-foreground">{JSON.stringify(scanResults[opt.value], null, 2)}</pre>
                            )}
                          </CardContent>
                        </Card>
                      )
                    )}
                  </ScanAccordion>
                ))}
              </div>
            )}

            {/* Keep existing audit report for compatibility */}
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
