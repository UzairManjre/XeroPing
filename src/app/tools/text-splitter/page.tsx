import TextSplitterClient from './TextSplitterClient';

export const metadata = {
  title: 'Text Splitter & Regex Parser | Chunk Strings Locally',
  description: 'Split massive text blocks by character limits, delimiters, or complex Regex patterns. Processes 100% locally in your browser for total privacy.',
  alternates: {
    canonical: 'https://xeroping.online/tools/text-splitter',
  },
  keywords: [
    'local text splitter', 'regex string parser browser', 'split text by length offline',
    'chunk large text files local', 'split csv string by comma',
    'regex extract array offline', 'parse logs by regex locally',
    'split text into paragraphs online', 'safe string chunker',
    'split 50mb text file browser', 'text tokenizer offline',
    'extract data with regex client side',
  ].join(', '),
  openGraph: {
    title: 'Text Splitter & Regex Parser | Chunk Strings Locally',
    description: 'Split massive text blocks by length or Regex locally. No uploads.',
    images: [{ url: 'https://xeroping.online/og/text-splitter.png', width: 1200, height: 630 }],
    url: 'https://xeroping.online/tools/text-splitter',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Zero PingDev',
    title: 'Text Splitter & Regex Parser | Chunk Strings Locally',
    description: 'Split text by length or Regex locally. No server limits.',
    images: ['https://xeroping.online/og/text-splitter.png'],
  },
};

export default function TextSplitterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Zero Ping", "item": "https://xeroping.online" },
          { "@type": "ListItem", "position": 2, "name": "Text Splitter", "item": "https://xeroping.online/tools/text-splitter" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://xeroping.online/tools/text-splitter/#app",
        "name": "Zero Ping Text Splitter & Parser",
        "url": "https://xeroping.online/tools/text-splitter",
        "description": "Chunk massive strings by character limits, symbols, or JavaScript Regex patterns entirely in your browser memory.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Split by exact character length",
          "Split by custom delimiter strings",
          "Advanced Regex splitting with capture group support",
          "Export chunks to JSON or CSV"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Can I split a text file that is too large to open in Notepad?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. If your file crashes standard text editors, paste it into Zero Ping's splitter. Because it uses browser-native memory allocation without UI thread blocking during the split, it handles massive strings much better than standard desktop editors."
            }
          },
          {
            "@type": "Question",
            "name": "What flavor of Regex does the text splitter use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero Ping uses the ECMAScript (JavaScript) Regex engine running directly in your browser. This includes support for modern features like lookaheads, lookbehinds, and named capture groups (depending on browser version)."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <TextSplitterClient />

      {/* SEO INFO BLOCK */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">The Ultimate Free Online Text Splitter</h2>
          <p className="font-bold text-summer-space/80 mb-6 text-lg">
            Working with massive blocks of text can be overwhelming, whether you're a data analyst cleaning up server logs, a writer structuring a novel, or a programmer formatting hardcoded strings. Our <strong>free online text splitter</strong> is designed to instantly break down large paragraphs and strings into manageable, bite-sized chunks exactly the way you want. Forget writing Python or bash scripts; slice your text online instantly without installing anything.
          </p>
          
          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Advanced Regex and Length Splitting Modes</h3>
          <p className="font-bold text-summer-space/80 mb-6">
            Simple space separation isn't always enough. That's why our tool offers advanced string chunking capabilities designed for power users:
          </p>
          <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
            <li><strong>Symbol Splitting:</strong> Break strings based on standard delimiters like commas, tabs, newlines, or custom pipes. Ideal for basic CSV parsing.</li>
            <li><strong>Length Splitting:</strong> Set a strict character limit (e.g., 280 characters) to slice paragraphs perfectly. Essential for preparing content for Twitter threads, SMS gateways, or database character limits.</li>
            <li><strong>Regex Splitting:</strong> Deploy complex Regular Expressions (Regex) for ultimate precision. Match complex patterns to extract tokens, emails, or specific log events effortlessly.</li>
          </ul>

          <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Customize Your Output Format with Chaining</h3>
          <p className="font-bold text-summer-space/80">
            Once your text is split, you often need it formatted for its next destination. Our built-in chaining tools allow you to append custom characters <em>before</em> and <em>after</em> every chunk, and choose exactly which separator connects the final pieces. You can transform a raw block of text into a formatted JSON array, SQL insert statement list, or HTML unordered list in seconds. Download the result as a text file or copy it instantly to your clipboard.
          </p>
        </div>
      </div>
    </>
  );
}
