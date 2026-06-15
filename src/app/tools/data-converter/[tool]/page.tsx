import DataConverterClient, { Tab } from '../DataConverterClient';

export function generateStaticParams() {
  return [
    { tool: 'json-csv' },
    { tool: 'csv-excel' },
    { tool: 'xml-json' },
    { tool: 'md-html' },
    { tool: 'clean-data' },
    { tool: 'split-data' },
    { tool: 'sql-query' },
    { tool: 'json-schema' }
  ];
}

const toolMap: Record<string, string> = {
  'json-csv': 'JSON to CSV / CSV to JSON Converter',
  'csv-excel': 'CSV to EXCEL / EXCEL to CSV Converter',
  'xml-json': 'XML to JSON / JSON to XML Converter',
  'md-html': 'Markdown to HTML Converter',
  'clean-data': 'Data Cleaner & Deduplicator',
  'split-data': 'Data Splitter (Chunk CSV/JSON)',
  'sql-query': 'SQL Query Runner on CSV & JSON',
  'json-schema': 'JSON Schema Generator'
};

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool;
  
  return {
    title: 'JSON, CSV & Excel Data Converter | Secure Local Parsing',
    description: 'Instantly convert massive JSON arrays to CSV or XML. Engineered for developers — parsing happens securely in your local RAM without cloud bottlenecks or timeouts.',
    alternates: {
      canonical: `https://zeronode.dev/tools/data-converter/${tool}`,
    },
    keywords: [
      'json to csv local converter', 'csv to excel browser', 'xml to json parser offline',
      'format massive json file browser', 'local data formatter', 'privacy safe data parser',
      'convert 50mb csv to json', 'client-side json minifier', 'json prettifier offline',
      'convert large json without server timeout', 'json to csv no upload',
      'parse csv without uploading to cloud', 'xlsx to json browser tool',
      'convert xml to json locally free',
    ].join(', '),
    openGraph: {
      title: 'JSON, CSV & Excel Data Converter | Secure Local Parsing',
      description: 'Convert massive JSON, CSV, XML, and Excel files in your browser. No cloud timeouts. No uploads.',
      images: [{ url: 'https://zeronode.dev/og/data-converter.png', width: 1200, height: 630 }],
      url: `https://zeronode.dev/tools/data-converter/${tool}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ZeroNodeDev',
      title: 'JSON, CSV & Excel Data Converter | Secure Local Parsing',
      description: 'Convert large JSON, CSV, XML, and Excel files locally. No cloud, no timeouts.',
      images: ['https://zeronode.dev/og/data-converter.png'],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool;
  const title = toolMap[tool] || 'Data Converter';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "ZeroNode", "item": "https://zeronode.dev" },
          { "@type": "ListItem", "position": 2, "name": "Data Converter", "item": "https://zeronode.dev/tools/data-converter" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://zeronode.dev/tools/data-converter/#app",
        "name": "ZeroNode Data Converter",
        "url": "https://zeronode.dev/tools/data-converter",
        "description": "Convert JSON, CSV, XML, and Excel files locally in your browser. Handles 50MB+ datasets without cloud timeouts or HTTP 504 errors.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Windows, macOS, Linux",
        "browserRequirements": "Requires modern browser with File API and WebAssembly",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "JSON to CSV and CSV to JSON conversion",
          "XML to JSON and JSON to XML parsing",
          "Excel (XLSX) to JSON and CSV export",
          "JSON minifier and prettifier",
          "Handles 50MB+ files without server timeouts"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Can ZeroNode convert very large JSON files without crashing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. ZeroNode's data converter uses streaming JSON parsing to handle files of 50MB or more without loading the entire dataset into the browser's main thread. This avoids the tab crashes and HTTP 504 timeouts common with cloud-based converters."
            }
          },
          {
            "@type": "Question",
            "name": "Does ZeroNode support Excel (XLSX) files?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. ZeroNode can parse .xlsx and .xls files directly in the browser and convert them to JSON, CSV, or XML. No Excel installation is required."
            }
          },
          {
            "@type": "Question",
            "name": "Is my data safe when using ZeroNode's converter?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All parsing runs inside a browser Web Worker using your device's local memory. Your data is never transmitted to ZeroNode's servers or any third party."
            }
          }
        ]
      }
    ]
  };

  let seoContent = null;

  if (tool === 'json-csv') {
    
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Ultimate Free JSON to CSV Converter</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Are you a developer, data analyst, or marketer struggling to open a massive <code>.json</code> file in Microsoft Excel or Google Sheets? Our <strong>free online JSON to CSV converter</strong> is the fastest and most reliable way to transform nested JSON arrays into flat, readable CSV files. No software installation is required!
        </p>
        <h3 className="text-xl font-black uppercase text-summer-space mt-6 mb-2">How to Convert JSON to CSV in 3 Steps</h3>
        <ol className="list-decimal pl-6 font-bold text-summer-space/80 mb-6 space-y-2">
          <li><strong>Copy and Paste</strong> your JSON data into the input field on the left.</li>
          <li>Ensure the <strong>JSON to CSV</strong> mode is selected in the top bar.</li>
          <li>Click <strong>Execute Data Conversion</strong>. Your CSV will appear instantly on the right, ready to be copied or downloaded.</li>
        </ol>
        <h3 className="text-xl font-black uppercase text-summer-space mt-6 mb-2">Why Use Our CSV to JSON Tool?</h3>
        <p className="font-bold text-summer-space/80">
          Conversely, if you have a spreadsheet and need to supply data to an API, our <strong>CSV to JSON converter</strong> translates rows and columns into perfect, valid JSON. This is crucial for software engineers building web applications, mobile apps, or migrating databases. It guarantees valid syntax, proper indentation, and escaped strings.
        </p>
      </div>
    );
  } else if (tool === 'csv-excel') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Free Online CSV to Excel (XLSX) Converter</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          CSV (Comma Separated Values) files are great for data transfer, but notoriously frustrating to open directly in Microsoft Excel. Excel frequently drops leading zeros from zip codes, mangles date formats, and corrupts UTF-8 special characters. Our <strong>free online CSV to Excel converter</strong> solves this instantly by generating a native, perfectly formatted <code>.xlsx</code> file.
        </p>
        <h3 className="text-xl font-black uppercase text-summer-space mt-6 mb-2">Benefits of Converting Excel back to CSV</h3>
        <p className="font-bold text-summer-space/80">
          Need to upload an Excel sheet to a CRM, database, or Python pandas script? Our tool seamlessly extracts data from binary Excel files and outputs clean, raw CSV text. No more dealing with hidden formatting or merged cells breaking your data pipelines.
        </p>
      </div>
    );
  } else if (tool === 'sql-query') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Run SQL Queries on CSV and JSON Online</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Why install MySQL or PostgreSQL just to filter a spreadsheet? Our <strong>free online SQL runner</strong> allows data analysts and developers to write standard SQL queries directly against raw CSV text or JSON arrays.
        </p>
        <h3 className="text-xl font-black uppercase text-summer-space mt-6 mb-2">Supported SQL Operations</h3>
        <ul className="list-disc pl-6 font-bold text-summer-space/80 mb-6 space-y-2">
          <li><strong>SELECT:</strong> Choose specific columns or use aliases (`SELECT name as FullName`).</li>
          <li><strong>WHERE:</strong> Filter datasets using standard logic (`WHERE active = true AND age &gt; 18`).</li>
          <li><strong>GROUP BY:</strong> Aggregate data with functions like COUNT(), SUM(), and AVG().</li>
          <li><strong>ORDER BY:</strong> Sort your results (`ORDER BY price DESC`).</li>
        </ul>
        <p className="font-bold text-summer-space/80">
          This is the ultimate tool for rapid data exploration. Instantly view your query results in a clean, interactive Table View, or export the filtered data as JSON for your applications.
        </p>
      </div>
    );
  } else if (tool === 'clean-data') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Free Online Data Cleaner & Deduplicator</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Dirty data costs businesses millions. Raw exports from CRMs or scraped data often contain duplicate records, trailing spaces, and empty rows. Our <strong>free online data cleaner</strong> instantly sanitizes your JSON arrays and CSV strings. With a single click, you can deduplicate exact matches, trim hidden whitespace, and delete null rows, ensuring your datasets are pristine and ready for machine learning or database import.
        </p>
      </div>
    );
  } else if (tool === 'split-data') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Free Online Data Splitter (Chunk CSV/JSON)</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Have a massive CSV or JSON file that is too large to upload to an API or open in Excel? Our <strong>free online data splitter</strong> allows you to chunk huge datasets into smaller, manageable files. Simply specify the number of rows per chunk, and our tool will generate a downloadable ZIP archive containing your perfectly split data files. Ideal for bypassing file upload limits on systems like Shopify, Salesforce, or WordPress.
        </p>
      </div>
    );
  } else if (tool === 'xml-json') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">XML to JSON Converter Online</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Many legacy enterprise systems and RSS feeds still rely on XML, but modern web applications run on JSON. Use our <strong>free online XML to JSON converter</strong> to instantly translate bulky XML tags into clean, lightweight JSON objects. We also support bidirectional <strong>JSON to XML</strong> conversion for engineers integrating with SOAP APIs or older banking systems.
        </p>
      </div>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <DataConverterClient activeTab={tool as Tab} />
      
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        {seoContent || (
          <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">The Best Free Online Data Converter</h2>
            <p className="font-bold text-summer-space/80">
              ZeroNode offers the ultimate suite of free online data conversion utilities. Whether you need to run SQL queries on CSV files, clean messy data, generate JSON schemas, or convert XML, our browser-based tools are lightning fast and strictly preserve your data integrity.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
