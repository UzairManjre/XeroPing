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

const toolTitles: Record<string, string> = {
  'json-csv': 'JSON to CSV Converter',
  'csv-excel': 'CSV to Excel Converter',
  'xml-json': 'XML to JSON Converter',
  'md-html': 'Markdown to HTML Converter',
  'clean-data': 'Data Cleaner & Formatter',
  'split-data': 'Data Splitter',
  'sql-query': 'SQL Query Engine',
  'json-schema': 'JSON Schema Generator'
};

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool;
  const title = toolTitles[tool] || 'Data Converter Toolkit';
  
  return {
    title: `${title} | Zero Ping Utilities`,
    description: `Free, private, local ${title.toLowerCase()} that runs entirely in your browser. No data leaves your machine.`,
    alternates: {
      canonical: `https://xeroping.online/tools/data-converter/${tool}`,
    },
    openGraph: {
      title: `${title} | Zero Ping Utilities`,
      description: `Free, private, local ${title.toLowerCase()} that runs entirely in your browser.`,
      url: `https://xeroping.online/tools/data-converter/${tool}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ZeroPing',
      title: `${title} | Zero Ping Utilities`,
      description: `Free, private, local ${title.toLowerCase()} that runs entirely in your browser.`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool as Tab;
  
  return (
    <>
      <DataConverterClient activeTab={tool} />
    </>
  );
}
