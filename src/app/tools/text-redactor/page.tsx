import TextRedactorClient from './TextRedactorClient';

export const metadata = {
  title: 'Text Redactor | Sanitize Logs & Mask PII Locally',
  description: 'Instantly redact API keys, PII, and passwords from logs before sharing them. 100% client-side sanitization — your raw logs are never uploaded to a server.',
  alternates: {
    canonical: 'https://zeronode.dev/tools/text-redactor',
  },
  keywords: [
    'local text redactor', 'offline log sanitizer', 'remove api keys from text',
    'mask pii in logs browser', 'anonymize data locally', 'redact emails from text offline',
    'hide passwords in code snippet', 'scrub sensitive data offline',
    'client side text masking tool', 'sanitize stack trace before posting',
    'remove ip addresses from logs', 'secure text redaction browser',
  ].join(', '),
  openGraph: {
    title: 'Text Redactor | Sanitize Logs & Mask PII Locally',
    description: 'Redact API keys, PII, and passwords from logs locally. No uploads.',
    images: [{ url: 'https://zeronode.dev/og/text-redactor.png', width: 1200, height: 630 }],
    url: 'https://zeronode.dev/tools/text-redactor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ZeroNodeDev',
    title: 'Text Redactor | Sanitize Logs Locally',
    description: 'Client-side log sanitizer. Mask API keys and PII securely.',
    images: ['https://zeronode.dev/og/text-redactor.png'],
  },
};

export default function TextRedactorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "ZeroNode", "item": "https://zeronode.dev" },
          { "@type": "ListItem", "position": 2, "name": "Text Redactor", "item": "https://zeronode.dev/tools/text-redactor" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://zeronode.dev/tools/text-redactor/#app",
        "name": "ZeroNode Local Text Redactor",
        "url": "https://zeronode.dev/tools/text-redactor",
        "description": "Regex-powered client-side text sanitizer. Automatically finds and masks API keys, passwords, IPs, emails, and credit cards without uploading your data.",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Auto-detects IPv4/IPv6, MAC addresses, and emails",
          "Auto-detects JWTs, AWS Keys, and Bearer tokens",
          "Custom Regex support",
          "100% offline processing"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is my raw text sent to your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. The Text Redactor uses client-side JavaScript regex engines to scan and mask your text. Your raw logs or code snippets never leave your browser."
            }
          },
          {
            "@type": "Question",
            "name": "What types of sensitive data can the redactor detect?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "It automatically detects and masks IPv4/IPv6 addresses, MAC addresses, Email addresses, Credit Card numbers, JWT tokens, AWS Access Keys, and standard UUIDs. You can also add custom Regex patterns."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <TextRedactorClient />

      {/* SEO INFO BLOCK */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">What is an Online Text Redactor?</h2>
          <p className="font-bold text-summer-space/80 mb-6 text-lg">
            A text redactor is an essential tool for developers, system administrators, and security professionals who need to share logs, configuration files, or code snippets without exposing sensitive information. Our <strong>free online text redactor</strong> automatically scans your text for common secrets like API keys, passwords, email addresses, credit card numbers, and IP addresses, replacing them with safe placeholder values or cryptographic hashes.
          </p>
          
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Why Sanitize Log Files?</h3>
          <p className="font-bold text-summer-space/80 mb-6">
            When debugging complex systems, engineers often need to post log files to public forums like Stack Overflow, GitHub issues, or send them to third-party support teams. These raw logs frequently contain PII (Personally Identifiable Information) or sensitive authentication tokens:
          </p>
          <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
            <li><strong>Authentication Tokens:</strong> Exposed JWTs or Bearer tokens can allow attackers to hijack user sessions.</li>
            <li><strong>Cloud Credentials:</strong> Accidentally pushing AWS Access Keys or GCP JSON keys can lead to massive financial damage.</li>
            <li><strong>User PII:</strong> Leaking customer email addresses, phone numbers, or credit card digits violates GDPR, CCPA, and PCI-DSS compliance.</li>
          </ul>
          <p className="font-bold text-summer-space/80 mb-6">
            Failing to redact this data can lead to immediate security breaches. Using our online log redaction tool ensures your diagnostic data is safe to share publicly.
          </p>

          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Custom RegEx Pattern Matching</h3>
          <p className="font-bold text-summer-space/80">
            While our tool includes built-in auto-detectors for common secrets (Emails, IPs, Credit Cards, Bearer Tokens), every application has unique data formats. Our free online redactor supports custom Regular Expressions (RegEx), allowing you to define exact patterns for your proprietary user IDs, custom session identifiers, or specialized logging formats. Simply input your regex rule, and the tool will instantly find and mask those specific strings throughout your entire document.
          </p>
        </div>
      </div>
    </>
  );
}
