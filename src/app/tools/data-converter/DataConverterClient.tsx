'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { marked } from 'marked';
import { xml2json, json2xml } from 'xml-js';
import JSZip from 'jszip';
import { ArrowRight, Download, FileJson, Settings2, FileSpreadsheet, FileCode2, FileText, AlertCircle, Copy, Check, Scissors, Brush, Database } from 'lucide-react';
import AdUnit from '@/components/AdUnit';
import * as Diff from 'diff';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLocalHistory } from '@/hooks/useLocalHistory';

export type Tab = 'json-csv' | 'csv-excel' | 'xml-json' | 'md-html' | 'clean-data' | 'split-data' | 'sql-query' | 'json-schema';

// Lossless JSON Schema Inferrer
function generateJsonSchema(json: any): any {
  if (json === null) return { type: 'null' };
  const type = typeof json;
  if (Array.isArray(json)) {
    const itemsSchema = json.length > 0 ? generateJsonSchema(json[0]) : {};
    return { type: 'array', items: itemsSchema };
  }
  if (type === 'object') {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(json)) {
      properties[k] = generateJsonSchema(v);
      required.push(k);
    }
    return { type: 'object', properties, required };
  }
  if (type === 'string') return { type: 'string' };
  if (type === 'number') return { type: 'number' };
  if (type === 'boolean') return { type: 'boolean' };
  return {};
}

// Local SQL Query Engine
function runLocalSqlQuery(sql: string, dataset: any[]): any[] {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const selectMatch = cleanSql.match(/SELECT\s+(.*?)(?:\s+FROM\s+\S+)?(?:\s+WHERE\s+(.*?))?(?:\s+GROUP\s+BY\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?$/i);
  
  if (!selectMatch) {
    throw new Error("Syntax Error: Supported format SELECT col1, col2 WHERE col1 = 'val' GROUP BY col ORDER BY col LIMIT n");
  }
  
  const selectColsStr = selectMatch[1].trim();
  const whereCondStr = selectMatch[2] ? selectMatch[2].trim() : null;
  const groupByStr = selectMatch[3] ? selectMatch[3].trim() : null;
  const orderByStr = selectMatch[4] ? selectMatch[4].trim() : null;
  const limitStr = selectMatch[5] ? selectMatch[5].trim() : null;
  
  let result = [...dataset];
  
  // 1. WHERE Filter
  if (whereCondStr) {
    result = result.filter(row => {
      try {
        let evalExpr = whereCondStr;
        const keys = Object.keys(row);
        for (const key of keys) {
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          const val = row[key];
          const valRepr = typeof val === 'string' ? `'${val.replace(/'/g, "\\'")}'` : String(val);
          evalExpr = evalExpr.replace(regex, valRepr);
        }
        
        evalExpr = evalExpr
          .replace(/=/g, '===')
          .replace(/!=====/g, '!==')
          .replace(/<>/g, '!==')
          .replace(/\band\b/gi, '&&')
          .replace(/\bor\b/gi, '||');
          
        // eslint-disable-next-line no-eval
        return eval(evalExpr);
      } catch (e) {
        return false;
      }
    });
  }
  
  // 2. GROUP BY & Aggregation
  if (groupByStr) {
    const groupKeys = groupByStr.split(',').map(s => s.trim());
    const groups: Record<string, any[]> = {};
    
    for (const row of result) {
      const keyVal = groupKeys.map(k => String(row[k] ?? '')).join('|');
      if (!groups[keyVal]) groups[keyVal] = [];
      groups[keyVal].push(row);
    }
    
    const parsedCols = selectColsStr.split(',').map(s => {
      const aliasMatch = s.match(/(.*?)\s+as\s+(\S+)/i);
      const expr = aliasMatch ? aliasMatch[1].trim() : s.trim();
      const alias = aliasMatch ? aliasMatch[2].trim() : expr;
      return { expr, alias };
    });
    
    const aggregatedResults: any[] = [];
    
    for (const [, rows] of Object.entries(groups)) {
      const firstRow = rows[0];
      const newRow: any = {};
      
      for (const col of parsedCols) {
        const expr = col.expr.toLowerCase();
        if (expr === 'count(*)' || expr === 'count(1)') {
          newRow[col.alias] = rows.length;
        } else if (expr.startsWith('sum(')) {
          const field = expr.slice(4, -1);
          newRow[col.alias] = rows.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
        } else if (expr.startsWith('avg(')) {
          const field = expr.slice(4, -1);
          const sum = rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
          newRow[col.alias] = rows.length > 0 ? (sum / rows.length) : 0;
        } else {
          newRow[col.alias] = firstRow[col.expr] ?? '';
        }
      }
      aggregatedResults.push(newRow);
    }
    result = aggregatedResults;
  } else {
    // Projection
    if (selectColsStr !== '*') {
      const parsedCols = selectColsStr.split(',').map(s => {
        const aliasMatch = s.match(/(.*?)\s+as\s+(\S+)/i);
        const expr = aliasMatch ? aliasMatch[1].trim() : s.trim();
        const alias = aliasMatch ? aliasMatch[2].trim() : expr;
        return { expr, alias };
      });
      
      result = result.map(row => {
        const newRow: any = {};
        for (const col of parsedCols) {
          newRow[col.alias] = row[col.expr] ?? null;
        }
        return newRow;
      });
    }
  }
  
  // 3. ORDER BY
  if (orderByStr) {
    const orderParts = orderByStr.split(' ');
    const orderCol = orderParts[0].trim();
    const isDesc = orderParts[1] && orderParts[1].toLowerCase() === 'desc';
    
    result.sort((a, b) => {
      const valA = a[orderCol];
      const valB = b[orderCol];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const comp = valA < valB ? -1 : 1;
      return isDesc ? -comp : comp;
    });
  }
  
  // 4. LIMIT
  if (limitStr) {
    const limitNum = parseInt(limitStr, 10);
    result = result.slice(0, limitNum);
  }
  
  return result;
}

export default function DataConverterClient({ activeTab }: { activeTab: Tab }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Mode Specific Controls
  const [jsonCsvDir, setJsonCsvDir] = useState<'json2csv' | 'csv2json'>('json2csv');
  const [xmlJsonDir, setXmlJsonDir] = useState<'xml2json' | 'json2xml'>('xml2json');
  const [csvExcelDir, setCsvExcelDir] = useState<'csv2excel' | 'excel2csv'>('csv2excel');
  
  // Code Formatting option (Indent spacing)
  const [indentSpacing, setIndentSpacing] = useState<number>(2); // 2 spaces, 4 spaces

  // SQL State
  const [sqlQuery, setSqlQuery] = useState('SELECT name, role WHERE active = true ORDER BY name');
  const [showTableView, setShowTableView] = useState(true);

  // Cleaner & Splitter State
  const [cleanFormat, setCleanFormat] = useState<'json' | 'csv'>('json');
  const [cleanOptions, setCleanOptions] = useState({ dedupe: true, removeEmpty: true, trim: true });
  const [splitFormat, setSplitFormat] = useState<'json' | 'csv'>('json');
  const [splitChunkSize, setSplitChunkSize] = useState<number>(500);

  // For Binary Excel Files
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const getHistoryKey = () => {
    if (activeTab === 'json-csv') return `json_csv_${jsonCsvDir}`;
    if (activeTab === 'csv-excel') return `csv_excel_${csvExcelDir}`;
    if (activeTab === 'xml-json') return `xml_json_${xmlJsonDir}`;
    if (activeTab === 'clean-data') return `clean_data_${cleanFormat}`;
    if (activeTab === 'split-data') return `split_data_${splitFormat}`;
    return activeTab;
  };
  const { history, addHistory, clearHistory } = useLocalHistory(getHistoryKey());

  const getExampleData = () => {
    switch (activeTab) {
      case 'json-csv':
        return jsonCsvDir === 'json2csv' 
          ? '[\n  { "id": 101, "name": "Alice Vance", "role": "Engineer", "active": true },\n  { "id": 102, "name": "Bob Vance", "role": "Sales", "active": false },\n  { "id": 103, "name": "Charlie Vance", "role": "HR", "active": true }\n]'
          : 'id,name,role,active\n101,Alice Vance,Engineer,true\n102,Bob Vance,Sales,false\n103,Charlie Vance,HR,true';
      case 'csv-excel':
        return 'Item,Quantity,Price,Total\nLaptop,5,999.00,4995.00\nMonitor,10,199.00,1990.00\nKeyboard,15,49.00,735.00';
      case 'xml-json':
        return xmlJsonDir === 'xml2json'
          ? '<?xml version="1.0" encoding="UTF-8"?>\n<company name="TechCorp">\n  <employee id="1">\n    <name>Alice Vance</name>\n    <role>Engineer</role>\n  </employee>\n  <employee id="2">\n    <name>Bob Vance</name>\n    <role>Sales</role>\n  </employee>\n</company>'
          : '{\n  "company": {\n    "employee": [\n      { "_attributes": { "id": "1" }, "name": { "_text": "Alice Vance" }, "role": { "_text": "Engineer" } },\n      { "_attributes": { "id": "2" }, "name": { "_text": "Bob Vance" }, "role": { "_text": "Sales" } }\n    ]\n  }\n}';
      case 'md-html':
        return '# Zero Ping Utility Network\n\nThis is an online **Markdown** preview!\n\n## Features\n- Fast conversion\n- Neo-Brutalist design\n- Interactive tools\n\nCheck the project [GitHub](https://github.com)!';
      case 'clean-data':
        return cleanFormat === 'json'
          ? '[\n  { "id": 101, "name": "Alice Vance ", "role": "Engineer" },\n  { "id": 101, "name": "Alice Vance", "role": "Engineer" },\n  { "id": 102, "name": "  Bob Vance", "role": "Sales" },\n  { "id": null, "name": "", "role": null }\n]'
          : 'id,name,role\n101,Alice Vance ,Engineer\n101,Alice Vance,Engineer\n102,  Bob Vance,Sales\n,,';
      case 'split-data':
        return splitFormat === 'json'
          ? '[\n  { "item": "Alpha" },\n  { "item": "Beta" },\n  { "item": "Gamma" },\n  { "item": "Delta" },\n  { "item": "Epsilon" },\n  { "item": "Zeta" },\n  { "item": "Eta" },\n  { "item": "Theta" }\n]'
          : 'item\nAlpha\nBeta\nGamma\nDelta\nEpsilon\nZeta\nEta\nTheta';
      case 'sql-query':
        return '[\n  { "name": "Alice", "role": "Engineer", "active": true },\n  { "name": "Bob", "role": "Designer", "active": false },\n  { "name": "Charlie", "role": "Engineer", "active": true }\n]';
      case 'json-schema':
        return '{\n  "id": 1,\n  "product": "Workspace Monitor",\n  "specs": {\n    "resolution": "4K",\n    "refreshRate": 144\n  },\n  "inStock": true\n}';
      default:
        return '';
    }
  };

  useEffect(() => {
    setInput('');
    setOutput('');
    setError('');
    setExcelFile(null);
    setShowDiff(false);
  }, [activeTab]);

  const handleConvert = async () => {
    setError('');
    setOutput('');
    try {
      if (activeTab === 'json-csv') {
        if (jsonCsvDir === 'json2csv') {
          const parsed = JSON.parse(input);
          const csv = Papa.unparse(parsed);
          setOutput(csv);
        } else {
          const parsed = Papa.parse(input, { header: true, skipEmptyLines: true });
          if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message);
          setOutput(JSON.stringify(parsed.data, null, indentSpacing));
        }
      } 
      
      else if (activeTab === 'xml-json') {
        if (xmlJsonDir === 'xml2json') {
          const result = xml2json(input, { compact: true, spaces: indentSpacing });
          setOutput(result);
        } else {
          const parsed = JSON.parse(input);
          const xml = json2xml(parsed, { compact: true, spaces: indentSpacing });
          setOutput(xml);
        }
      }
      
      else if (activeTab === 'md-html') {
        const html = marked.parse(input);
        setOutput(html as string);
      }
      
      else if (activeTab === 'csv-excel') {
        if (csvExcelDir === 'csv2excel') {
          const parsed = Papa.parse(input, { skipEmptyLines: true });
          const ws = XLSX.utils.aoa_to_sheet(parsed.data as any[][]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          triggerDownload(new Blob([wbout]), 'converted.xlsx');
        } else {
          if (!excelFile) throw new Error('Please upload an Excel file first.');
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const wb = XLSX.read(data, { type: 'array' });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const csv = XLSX.utils.sheet_to_csv(ws);
              setOutput(csv);
            } catch (err: any) {
              setError(err.message || "Failed to parse Excel file.");
            }
          };
          reader.readAsArrayBuffer(excelFile);
        }
      }

      else if (activeTab === 'clean-data') {
        let dataArray: any[] = [];
        if (cleanFormat === 'json') {
          dataArray = JSON.parse(input);
          if (!Array.isArray(dataArray)) throw new Error("JSON must be an array of objects to clean.");
        } else {
          const parsed = Papa.parse(input, { header: true, skipEmptyLines: false });
          if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message);
          dataArray = parsed.data;
        }

        let cleaned = [...dataArray];

        if (cleanOptions.trim) {
          cleaned = cleaned.map(row => {
            if (typeof row === 'object' && row !== null) {
              const newRow: any = {};
              for (const [k, v] of Object.entries(row)) {
                newRow[k] = typeof v === 'string' ? v.trim() : v;
              }
              return newRow;
            }
            return typeof row === 'string' ? row.trim() : row;
          });
        }

        if (cleanOptions.removeEmpty) {
          cleaned = cleaned.filter(row => {
            if (typeof row === 'object' && row !== null) {
              return Object.values(row).some(v => v !== null && v !== '' && v !== undefined);
            }
            return row !== null && row !== '' && row !== undefined;
          });
        }

        if (cleanOptions.dedupe) {
          const uniqueSet = new Set();
          cleaned = cleaned.filter(row => {
            const stringified = JSON.stringify(row);
            if (uniqueSet.has(stringified)) return false;
            uniqueSet.add(stringified);
            return true;
          });
        }

        if (cleanFormat === 'json') {
          setOutput(JSON.stringify(cleaned, null, indentSpacing));
        } else {
          setOutput(Papa.unparse(cleaned));
        }
      }

      else if (activeTab === 'split-data') {
        let dataArray: any[] = [];
        if (splitFormat === 'json') {
          dataArray = JSON.parse(input);
          if (!Array.isArray(dataArray)) throw new Error("JSON must be an array of objects to split.");
        } else {
          const parsed = Papa.parse(input, { header: true, skipEmptyLines: true });
          if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message);
          dataArray = parsed.data;
        }

        if (splitChunkSize <= 0) throw new Error("Chunk size must be greater than 0.");
        
        const zip = new JSZip();
        let chunkIndex = 1;
        
        for (let i = 0; i < dataArray.length; i += splitChunkSize) {
          const chunk = dataArray.slice(i, i + splitChunkSize);
          let content = '';
          if (splitFormat === 'json') {
            content = JSON.stringify(chunk, null, indentSpacing);
            zip.file(`chunk_${chunkIndex}.json`, content);
          } else {
            content = Papa.unparse(chunk);
            zip.file(`chunk_${chunkIndex}.csv`, content);
          }
          chunkIndex++;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        triggerDownload(zipBlob, `split_${splitFormat}_data.zip`);
        setOutput(`Successfully generated ${chunkIndex - 1} files!\nDownload should start automatically.`);
      }

      else if (activeTab === 'sql-query') {
        let parsedData: any[] = [];
        // Support either JSON array or CSV string as query input dataset
        try {
          parsedData = JSON.parse(input);
        } catch {
          const parsed = Papa.parse(input, { header: true, skipEmptyLines: true });
          if (parsed.errors.length > 0) throw new Error("Input must be a valid JSON array or CSV data block.");
          parsedData = parsed.data;
        }
        
        if (!Array.isArray(parsedData)) {
          throw new Error("Target dataset must be an array of records.");
        }

        const queryResult = runLocalSqlQuery(sqlQuery, parsedData);
        setOutput(JSON.stringify(queryResult, null, indentSpacing));
      }

      else if (activeTab === 'json-schema') {
        const parsed = JSON.parse(input);
        const schema = generateJsonSchema(parsed);
        setOutput(JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          ...schema
        }, null, indentSpacing));
      }

      addHistory(input);
    } catch (err: any) {
      setError(err.message || 'Invalid format or parsing error.');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useKeyboardShortcuts({
    onExecute: handleConvert,
    onCopy: handleCopy
  });

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExcelFile(e.target.files[0]);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadText = () => {
    if (!output) return;
    let ext = 'txt';
    if (activeTab === 'json-csv') ext = jsonCsvDir === 'json2csv' ? 'csv' : 'json';
    else if (activeTab === 'xml-json') ext = xmlJsonDir === 'xml2json' ? 'json' : 'xml';
    else if (activeTab === 'md-html') ext = 'html';
    else if (activeTab === 'csv-excel' && csvExcelDir === 'excel2csv') ext = 'csv';
    else if (activeTab === 'sql-query') ext = 'json';
    else if (activeTab === 'json-schema') ext = 'json';

    const blob = new Blob([output], { type: 'text/plain' });
    triggerDownload(blob, `converted.${ext}`);
  };

  // Convert current Output string to object array if valid to render in SQL Table view
  const parsedTableData = useMemo(() => {
    if (activeTab === 'sql-query' && output) {
      try {
        const data = JSON.parse(output);
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
    }
    return null;
  }, [activeTab, output]);

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #219ebc' }}>Free Online Data Converter</h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Translate massive datasets instantly online.</p>
      </header>

      {/* TABBED INTERFACE */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(['json-csv', 'csv-excel', 'xml-json', 'md-html', 'clean-data', 'split-data', 'sql-query', 'json-schema'] as Tab[]).map((tab) => (
          <Link 
            key={tab} href={`/tools/data-converter/${tab}`}
            className={`px-4 py-2 md:px-5 md:py-2.5 border-[4px] border-summer-space font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-sm flex items-center gap-2 ${
              activeTab === tab ? 'bg-summer-sky text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
            }`}
          >
            {tab === 'json-csv' && <FileJson className="w-4 h-4" />}
            {tab === 'csv-excel' && <FileSpreadsheet className="w-4 h-4" />}
            {tab === 'xml-json' && <FileCode2 className="w-4 h-4" />}
            {tab === 'md-html' && <FileText className="w-4 h-4" />}
            {tab === 'clean-data' && <Brush className="w-4 h-4" />}
            {tab === 'split-data' && <Scissors className="w-4 h-4" />}
            {tab === 'sql-query' && <Database className="w-4 h-4" />}
            {tab === 'json-schema' && <FileCode2 className="w-4 h-4" />}
            {tab.replace('-', ' ').toUpperCase()}
          </Link>
        ))}
      </div>

      {/* TOP CONFIGURATION ROW */}
      <div className="flex flex-wrap justify-center mb-6 gap-4 items-center">
        {/* Formatting indent spacing selectors */}
        {(activeTab === 'json-csv' || activeTab === 'xml-json' || activeTab === 'clean-data' || activeTab === 'sql-query' || activeTab === 'json-schema') && (
          <div className="flex bg-white border-[3px] border-summer-space p-1 text-xs">
            <span className="px-2 py-1 font-black uppercase text-summer-space/50 select-none">Indentation:</span>
            <button onClick={() => setIndentSpacing(2)} className={`px-2.5 py-1 font-black ${indentSpacing === 2 ? 'bg-summer-space text-white' : 'text-summer-space'}`}>2 Spaces</button>
            <button onClick={() => setIndentSpacing(4)} className={`px-2.5 py-1 font-black ${indentSpacing === 4 ? 'bg-summer-space text-white' : 'text-summer-space'}`}>4 Spaces</button>
          </div>
        )}

        {activeTab === 'json-csv' && (
          <div className="flex bg-white border-[3px] border-summer-space p-1">
            <button onClick={() => setJsonCsvDir('json2csv')} className={`px-4 py-2 font-black uppercase text-xs ${jsonCsvDir === 'json2csv' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>JSON to CSV</button>
            <button onClick={() => setJsonCsvDir('csv2json')} className={`px-4 py-2 font-black uppercase text-xs ${jsonCsvDir === 'csv2json' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>CSV to JSON</button>
          </div>
        )}
        {activeTab === 'xml-json' && (
          <div className="flex bg-white border-[3px] border-summer-space p-1">
            <button onClick={() => setXmlJsonDir('xml2json')} className={`px-4 py-2 font-black uppercase text-xs ${xmlJsonDir === 'xml2json' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>XML to JSON</button>
            <button onClick={() => setXmlJsonDir('json2xml')} className={`px-4 py-2 font-black uppercase text-xs ${xmlJsonDir === 'json2xml' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>JSON to XML</button>
          </div>
        )}
        {activeTab === 'csv-excel' && (
          <div className="flex bg-white border-[3px] border-summer-space p-1">
            <button onClick={() => setCsvExcelDir('csv2excel')} className={`px-4 py-2 font-black uppercase text-xs ${csvExcelDir === 'csv2excel' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>CSV to EXCEL</button>
            <button onClick={() => setCsvExcelDir('excel2csv')} className={`px-4 py-2 font-black uppercase text-xs ${csvExcelDir === 'excel2csv' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>EXCEL to CSV</button>
          </div>
        )}
        {activeTab === 'clean-data' && (
          <div className="flex bg-white border-[3px] border-summer-space p-1 gap-4 items-center pl-4 flex-wrap">
            <div className="flex border-r-[3px] border-summer-space pr-4">
              <button onClick={() => setCleanFormat('json')} className={`px-4 py-2 font-black uppercase text-xs ${cleanFormat === 'json' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>JSON Array</button>
              <button onClick={() => setCleanFormat('csv')} className={`px-4 py-2 font-black uppercase text-xs ${cleanFormat === 'csv' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>CSV String</button>
            </div>
            <label className="flex items-center gap-2 text-xs font-black uppercase text-summer-space cursor-pointer">
              <input type="checkbox" checked={cleanOptions.dedupe} onChange={() => setCleanOptions(p => ({...p, dedupe: !p.dedupe}))} className="w-4 h-4 accent-summer-space" /> Deduplicate
            </label>
            <label className="flex items-center gap-2 text-xs font-black uppercase text-summer-space cursor-pointer">
              <input type="checkbox" checked={cleanOptions.removeEmpty} onChange={() => setCleanOptions(p => ({...p, removeEmpty: !p.removeEmpty}))} className="w-4 h-4 accent-summer-space" /> Rm Empty Rows
            </label>
            <label className="flex items-center gap-2 text-xs font-black uppercase text-summer-space cursor-pointer pr-2">
              <input type="checkbox" checked={cleanOptions.trim} onChange={() => setCleanOptions(p => ({...p, trim: !p.trim}))} className="w-4 h-4 accent-summer-space" /> Trim Spaces
            </label>
          </div>
        )}
        {activeTab === 'split-data' && (
          <div className="flex bg-white border-[3px] border-summer-space p-1 gap-4 items-center pl-4">
            <div className="flex border-r-[3px] border-summer-space pr-4">
              <button onClick={() => setSplitFormat('json')} className={`px-4 py-2 font-black uppercase text-xs ${splitFormat === 'json' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>JSON Array</button>
              <button onClick={() => setSplitFormat('csv')} className={`px-4 py-2 font-black uppercase text-xs ${splitFormat === 'csv' ? 'bg-summer-space text-white' : 'text-summer-space'}`}>CSV String</button>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <span className="text-xs font-black uppercase text-summer-space">Rows per Chunk:</span>
              <input 
                type="number" min="1" 
                value={splitChunkSize} 
                onChange={(e) => setSplitChunkSize(parseInt(e.target.value) || 1)}
                className="w-24 p-1 border-[2px] border-summer-space text-center font-bold focus:outline-none focus:bg-summer-sky"
              />
            </div>
          </div>
        )}
        {activeTab === 'sql-query' && (
          <div className="flex bg-white border-[3px] border-summer-space p-1 text-xs">
            <span className="px-2 py-1 font-black uppercase text-summer-space/50 select-none">Output Format:</span>
            <button onClick={() => setShowTableView(false)} className={`px-2.5 py-1 font-black ${!showTableView ? 'bg-summer-space text-white' : 'text-summer-space'}`}>JSON Text</button>
            <button onClick={() => setShowTableView(true)} className={`px-2.5 py-1 font-black ${showTableView ? 'bg-summer-space text-white' : 'text-summer-space'}`}>Table View</button>
          </div>
        )}
      </div>

      {/* SQL QUERY INPUT FIELD (SQL-only block) */}
      {activeTab === 'sql-query' && (
        <div className="max-w-[1400px] mx-auto mb-6 bg-white border-[4px] border-summer-space p-4 shadow-brutal flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 font-black text-sm uppercase text-summer-space shrink-0"><Database className="w-5 h-5" /> SQL Query</div>
          <input 
            type="text" 
            value={sqlQuery} 
            onChange={e => setSqlQuery(e.target.value)}
            className="flex-grow p-3 border-[3px] border-summer-space text-sm font-mono font-bold focus:outline-none bg-zinc-50"
            placeholder="SELECT name, role WHERE active = true"
          />
        </div>
      )}

      {/* DUAL EDITOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT PANEL: INPUT */}
        <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[600px]">
          <div className="p-4 bg-summer-tiger border-b-[4px] border-summer-space flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-summer-space">
              {activeTab === 'sql-query' ? 'Target Dataset (JSON Array)' : 'Input Data'}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => {
                  setInput(getExampleData());
                  setOutput('');
                  setError('');
                }} 
                className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space hover:underline"
              >
                Load Example
              </button>

              {input === '' && history.length > 0 && (
                <button 
                  onClick={() => setInput(history[0].input)} 
                  className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 px-1.5 py-0.5 rounded transition-colors"
                >
                  Restore Last
                </button>
              )}

              {history.length > 0 && (
                <div className="relative group">
                  <button className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space flex items-center gap-1">
                    History ({history.length})
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border-[3px] border-summer-space shadow-brutal hidden group-hover:block z-50 text-left">
                    <div className="p-2 border-b-[2px] border-summer-space bg-zinc-50 font-black text-[10px] uppercase text-zinc-500 tracking-wider flex justify-between items-center">
                      <span>Recent inputs</span>
                      <button onClick={clearHistory} className="text-rose-500 hover:underline">Clear</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setInput(item.input);
                            setOutput('');
                            setError('');
                          }}
                          className="w-full text-left p-2 hover:bg-summer-sky border-b border-zinc-100 last:border-0 font-mono text-[11px] text-zinc-700 block truncate"
                          title={item.input}
                        >
                          <span className="text-[9px] text-zinc-400 mr-2 block">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {item.input.substring(0, 50)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <label className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space cursor-pointer hover:underline flex items-center gap-1">
                Upload
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json,.csv,.xml,.md,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setInput(event.target.result as string);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
              <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space">Clear</button>
            </div>
          </div>
          
          {activeTab === 'csv-excel' && csvExcelDir === 'excel2csv' ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center bg-zinc-50">
               <FileSpreadsheet className="w-16 h-16 text-summer-space/40 mb-4" />
               <p className="font-bold text-summer-space mb-4 text-center">Select an .xlsx file from your computer.</p>
               <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="block w-full max-w-sm text-sm text-summer-space file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-black file:bg-summer-space file:text-white hover:file:bg-summer-tiger hover:file:text-summer-space" />
               {excelFile && <p className="mt-4 text-sm font-bold text-emerald-600">Selected: {excelFile.name}</p>}
            </div>
          ) : (
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={(() => {
                switch (activeTab) {
                  case 'json-csv':
                    return jsonCsvDir === 'json2csv' 
                      ? '[\n  {\n    "id": 1,\n    "name": "John Doe",\n    "email": "john@example.com"\n  },\n  {\n    "id": 2,\n    "name": "Jane Smith",\n    "email": "jane@example.com"\n  }\n]'
                      : 'id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com';
                  case 'csv-excel':
                    return 'id,product,price\n1,Laptop,999.99\n2,Mouse,24.99\n3,Keyboard,74.99';
                  case 'xml-json':
                    return xmlJsonDir === 'xml2json'
                      ? '<?xml version="1.0" encoding="UTF-8"?>\n<users>\n  <user>\n    <id>1</id>\n    <name>John Doe</name>\n  </user>\n</users>'
                      : '{\n  "users": {\n    "user": {\n      "id": "1",\n      "name": "John Doe"\n    }\n  }\n}';
                  case 'md-html':
                    return '# Hello World\n\nThis is **markdown**.\n\n- Item 1\n- Item 2';
                  case 'clean-data':
                  case 'split-data':
                    return (cleanFormat === 'json' && activeTab === 'clean-data') || (splitFormat === 'json' && activeTab === 'split-data')
                      ? '[\n  { "data": "messy   " },\n  { "data": "messy   " },\n  { "data": null }\n]'
                      : 'col1,col2\n messy  , data\n messy  , data\n,';
                  case 'sql-query':
                    return '[\n  { "name": "Alice", "role": "Engineer", "active": true },\n  { "name": "Bob", "role": "Designer", "active": false }\n]';
                  case 'json-schema':
                    return '{\n  "name": "Widget",\n  "count": 10\n}';
                  default:
                    return 'Paste your raw data here...';
                }
              })()}
              className="flex-1 p-6 md:p-8 resize-none focus:outline-none font-mono text-sm bg-zinc-50 text-zinc-800 placeholder-zinc-400"
              spellCheck="false"
            />
          )}
        </div>

        {/* RIGHT PANEL: OUTPUT */}
        <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[600px]">
          <div className="p-4 bg-summer-sea border-b-[4px] border-summer-space flex justify-between items-center h-[60px]">
            <div className="flex items-center gap-4">
              <span className="font-black uppercase tracking-widest text-summer-space">Converted Output</span>
              {output && activeTab !== 'sql-query' && (
                <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-summer-space px-2 py-0.5 text-xs font-black uppercase tracking-wider text-summer-space hover:bg-summer-amber select-none">
                  <input 
                    type="checkbox" 
                    checked={showDiff} 
                    onChange={() => setShowDiff(prev => !prev)} 
                    className="accent-summer-space w-3.5 h-3.5"
                  />
                  Show Diff
                </label>
              )}
            </div>
            {output && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className={`flex items-center gap-1 border-[2px] border-summer-space px-2 py-1 text-xs font-black uppercase transition-colors ${copied ? 'bg-emerald-400 text-summer-space' : 'bg-white hover:bg-summer-amber'}`}>
                  {copied ? <Check className="w-3 h-3 text-summer-space" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={downloadText} className="flex items-center gap-1 bg-summer-space text-white border-[2px] border-summer-space px-2 py-1 text-xs font-black uppercase hover:bg-summer-tiger hover:text-summer-space transition-colors">
                  <Download className="w-3 h-3" /> Save File
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative bg-zinc-800 text-green-400 font-mono text-sm p-4 overflow-auto whitespace-pre-wrap break-words">
            {error ? (
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" /> <span>{error}</span>
              </div>
            ) : output ? (
              activeTab === 'sql-query' && showTableView && parsedTableData ? (
                /* INTERACTIVE TABLE VIEW FOR SQL QUERY */
                <div className="overflow-x-auto text-zinc-200">
                  <table className="w-full text-left border-collapse border border-zinc-700">
                    <thead>
                      <tr className="bg-zinc-900 text-white border-b border-zinc-700">
                        {Object.keys(parsedTableData[0]).map((key) => (
                          <th key={key} className="p-3 font-black uppercase text-xs tracking-wider border-r border-zinc-700">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700">
                      {parsedTableData.map((row: any, i: number) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-850'}>
                          {Object.values(row).map((val: any, j: number) => (
                            <td key={j} className="p-3 font-mono text-xs border-r border-zinc-700 break-all">{String(val ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : showDiff ? (
                <div className="space-y-0.5">
                  {Diff.diffLines(input, output).map((part, index) => {
                    const colorClass = part.added
                      ? 'bg-emerald-950/50 text-emerald-400 border-l-[3px] border-emerald-500 pl-2 font-bold'
                      : part.removed
                      ? 'bg-rose-950/50 text-rose-400 border-l-[3px] border-rose-500 pl-2 line-through opacity-80'
                      : 'text-zinc-400 pl-2 opacity-60';
                    return (
                      <span key={index} className={`block whitespace-pre-wrap ${colorClass}`}>
                        {part.value}
                      </span>
                    );
                  })}
                </div>
              ) : (
                output
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                <Settings2 className="w-24 h-24 text-green-400 mb-4" />
                <span className="text-green-400 font-black uppercase tracking-widest text-xl">Awaiting Conversion...</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* EXECUTE BUTTON */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleConvert}
          className="bg-summer-amber hover:bg-summer-tiger text-summer-space px-12 py-5 border-[4px] border-summer-space font-black uppercase tracking-widest text-xl transition-all shadow-[6px_6px_0px_#023047] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-3"
        >
          <Settings2 className="w-6 h-6 stroke-[3px]" /> Execute Data Conversion
        </button>
      </div>

      {/* SEO content removed; now rendered by server in page.tsx */}

    </div>
  );
}
