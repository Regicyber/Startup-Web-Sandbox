import { type AuditData, type AuditCategory } from './types';
import { Gauge, Accessibility, ShieldCheck, Search } from 'lucide-react';

const performance: AuditCategory = {
  id: 'performance',
  title: 'Performance',
  score: 92,
  Icon: Gauge,
  description: 'Metrics that measure how well your page performs. A high score means a fast and smooth user experience.',
  details: [
    { type: 'opportunity', title: 'Eliminate render-blocking resources', value: '1.2 s', description: 'Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.' },
    { type: 'opportunity', title: 'Properly size images', value: '0.8 s', description: 'Serve images that are appropriately-sized to save cellular data and improve load time.' },
    { type: 'diagnostic', title: 'Ensure text remains visible during webfont load', value: '', description: 'Leverage the font-display CSS feature to ensure text is user-visible while webfonts are loading.' },
    { type: 'diagnostic', title: 'Minimize main-thread work', value: '2.1 s', description: 'Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this.' },
  ],
  rawReport: `
    Performance Audit Details:
    - First Contentful Paint: 1.1s
    - Speed Index: 1.5s
    - Largest Contentful Paint: 2.2s
    - Time to Interactive: 2.8s
    - Total Blocking Time: 150ms
    - Cumulative Layout Shift: 0.05
    Key Issues:
    1. Unused JavaScript: 250 KB of JavaScript is not used on the page. Removing this could save 0.5s.
    2. Image Formats: Using next-gen formats like WebP or AVIF for images could save 200 KB.
    3. Caching Policy: Some assets have an inefficient cache policy, leading to repeated downloads.
    Recommendations: Code-split JavaScript bundles. Compress images and use modern formats. Implement a long-lived cache policy for static assets.
  `,
};

const accessibility: AuditCategory = {
  id: 'accessibility',
  title: 'Accessibility',
  score: 85,
  Icon: Accessibility,
  description: 'Checks to ensure your page is usable by people with disabilities or impairments.',
  details: [
    { type: 'opportunity', title: 'Image elements do not have [alt] attributes', value: '3 images', description: 'Informative elements should aim for short, descriptive alternate text. Decorative elements can be ignored with an empty alt attribute.' },
    { type: 'opportunity', title: 'Form elements do not have associated labels', value: '2 forms', description: 'Labels ensure that screen readers can properly read out what a form field is for.' },
    { type: 'diagnostic', title: '[user-scalable="no"] is used in the <meta name="viewport"> element', value: '', description: 'Disabling zooming is problematic for users with low vision who rely on screen magnification to properly see the contents of a web page.' },
  ],
  rawReport: `
    Accessibility Audit Details:
    - Contrast Ratio: Most text elements have a sufficient contrast ratio of 4.5:1 or higher. One footer link has a ratio of 3.2:1.
    - ARIA Roles: Proper ARIA roles are used for most interactive components. A custom dropdown menu is missing 'aria-haspopup'.
    - Keyboard Navigation: The site is mostly navigable via keyboard, but the modal dialog does not trap focus.
    Key Issues:
    1. Missing Alt Text: Three images are missing descriptive alt attributes, making them inaccessible to screen reader users.
    2. Low Contrast: A link in the footer has insufficient color contrast.
    3. Focus Trap: The "Subscribe" modal does not trap keyboard focus, allowing users to tab to elements behind the modal.
    Recommendations: Add descriptive alt text to all informative images. Increase the text color contrast in the footer. Implement a focus trap for the modal dialog.
  `,
};

const bestPractices: AuditCategory = {
  id: 'best-practices',
  title: 'Best Practices',
  score: 98,
  Icon: ShieldCheck,
  description: 'Looks for opportunities to improve the overall code health of your web page.',
  details: [
    { type: 'opportunity', title: 'Serves images with low resolution', value: '1 image', description: 'Image resolution is noticeably low, which can impact visual quality.' },
    { type: 'diagnostic', title: 'Browser errors were logged to the console', value: '1 error', description: 'Errors logged to the console can indicate that something is not working as intended.' },
    { type: 'diagnostic', title: 'Uses HTTPS', value: 'Passed', description: 'All network requests are served over a secure connection.' },
  ],
  rawReport: `
    Best Practices Audit Details:
    - HTTPS: The entire site is served over HTTPS, which is secure.
    - No Console Errors: The page loads without logging any errors to the browser console.
    - Deprecated APIs: The page does not use any deprecated browser APIs.
    - Doctype: HTML doctype is present and correct.
    Key Issues:
    1. No specific major issues found. The page follows modern web development standards well. One minor issue with a low-resolution icon was detected.
    Recommendations: Consider replacing the low-resolution icon with a higher-quality SVG or a larger PNG to improve visual fidelity on high-resolution displays.
  `,
};

const seo: AuditCategory = {
  id: 'seo',
  title: 'SEO',
  score: 90,
  Icon: Search,
  description: 'Checks to ensure that your page is optimized for search engine results ranking.',
  details: [
    { type: 'opportunity', title: 'Document does not have a meta description', value: '', description: 'Meta descriptions may be included in search results to concisely summarize page content.' },
    { type: 'diagnostic', title: 'Links have descriptive text', value: 'Passed', description: 'Descriptive link text helps search engines understand your content.' },
    { type: 'diagnostic', title: 'Page has a successful HTTP status code', value: 'Passed', description: 'Pages with a successful status code can be indexed by search engines.' },
  ],
  rawReport: `
    SEO Audit Details:
    - Meta Tags: The page has a title tag but is missing a meta description.
    - Crawlability: The page is not blocked by robots.txt. All links on the page are crawlable.
    - Canonicalization: A valid rel="canonical" link is present, preventing duplicate content issues.
    Key Issues:
    1. Missing Meta Description: The absence of a meta description means search engines will generate their own, which may not be optimal for click-through rates.
    Recommendations: Add a concise and compelling meta description (under 160 characters) to summarize the page's content and encourage clicks from search results.
  `,
};

export function getMockAuditData(url: string): AuditData {
  return {
    url,
    timestamp: new Date().toISOString(),
    categories: [
      { ...performance, score: Math.floor(Math.random() * 21) + 80 }, // 80-100
      { ...accessibility, score: Math.floor(Math.random() * 21) + 75 }, // 75-95
      { ...bestPractices, score: Math.floor(Math.random() * 11) + 90 }, // 90-100
      { ...seo, score: Math.floor(Math.random() * 21) + 80 }, // 80-100
    ],
  };
}
