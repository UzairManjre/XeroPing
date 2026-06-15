'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import cronstrue from 'cronstrue';
import parser from 'cron-parser';
import SparkMD5 from 'spark-md5';
import { Code, Clock, Image as ImageIcon, Lock, ShieldAlert, Download, Copy, Check, Settings2, FileCode2, AlertCircle } from 'lucide-react';
import AdUnit from '@/components/AdUnit';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLocalHistory } from '@/hooks/useLocalHistory';

export type Tab = 'jwt' | 'cron' | 'svg2jsx' | 'hash';

export default function DevToolkitClient({ activeTab }: { activeTab: Tab }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedHashField, setCopiedHashField] = useState<string | null>(null);

  // JWT Specific
  const [jwtStatus, setJwtStatus] = useState<{ isExpired: boolean; expDate?: string } | null>(null);

  // Cron Specific
  const [cronDates, setCronDates] = useState<string[]>([]);

  // SVG Specific
  const [svgOptions, setSvgOptions] = useState({ functional: true, currentColor: false, tailwind: false });

  // Hash Specific
  const [hashResults, setHashResults] = useState<{ md5: string; sha256: string; sha512: string; base64: string } | null>(null);

  const getHistoryKey = () => {
    return `dev_toolkit_${activeTab}`;
  };
  const { history, addHistory, clearHistory } = useLocalHistory(getHistoryKey());

  const getExampleData = () => {
    switch (activeTab) {
      case 'jwt':
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      case 'cron':
        return '*/15 8-18 * * 1-5';
      case 'svg2jsx':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb8500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert">\n  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>\n  <path d="M12 8v4"/>\n  <path d="M12 16h.01"/>\n</svg>`;
      case 'hash':
        return 'Zero Ping: Ultimate Free Online Tools & Utilities.';
      default:
        return '';
    }
  };

  useEffect(() => {
    setInput('');
    setOutput('');
    setError('');
    setJwtStatus(null);
    setCronDates([]);
    setHashResults(null);
    setCopiedHashField(null);
  }, [activeTab]);

  const handleExecute = async () => {
    setError('');
    setOutput('');
    
    try {
      if (activeTab === 'jwt') {
        const decodedHeader = jwtDecode(input, { header: true });
        const decodedPayload = jwtDecode(input);
        
        setOutput(JSON.stringify({ header: decodedHeader, payload: decodedPayload }, null, 2));

        if ((decodedPayload as any).exp) {
          const expDate = new Date((decodedPayload as any).exp * 1000);
          setJwtStatus({
            isExpired: expDate < new Date(),
            expDate: expDate.toLocaleString()
          });
        } else {
          setJwtStatus(null);
        }
      } 
      
      else if (activeTab === 'cron') {
        const desc = cronstrue.toString(input, { throwExceptionOnParseError: true });
        setOutput(desc);
        
        const interval = (parser as any).parseExpression(input);
        const dates = [];
        for (let i = 0; i < 5; i++) {
          dates.push(interval.next().toDate().toLocaleString());
        }
        setCronDates(dates);
      }
      
      else if (activeTab === 'svg2jsx') {
        let jsx = input;
        
        // Basic SVG to JSX string replacements
        jsx = jsx.replace(/class=/g, 'className=');
        jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
        jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
        jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
        jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
        jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
        jsx = jsx.replace(/stroke-miterlimit=/g, 'strokeMiterlimit=');
        jsx = jsx.replace(/viewbox=/gi, 'viewBox=');

        if (svgOptions.currentColor) {
          jsx = jsx.replace(/stroke="[^"]+"/g, 'stroke="currentColor"');
          jsx = jsx.replace(/fill="[^"]+"/g, 'fill="currentColor"');
        }

        if (svgOptions.functional) {
          const twClass = svgOptions.tailwind ? ' className="w-6 h-6 text-gray-900"' : '';
          jsx = `export default function Icon() {\n  return (\n    ${jsx.replace(/<svg/, `<svg${twClass}`)}\n  );\n}`;
        }

        setOutput(jsx);
      }
      
      else if (activeTab === 'hash') {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        // MD5
        const md5 = SparkMD5.hash(input);

        // SHA-256
        const hash256Buffer = await crypto.subtle.digest('SHA-256', data);
        const sha256 = Array.from(new Uint8Array(hash256Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        // SHA-512
        const hash512Buffer = await crypto.subtle.digest('SHA-512', data);
        const sha512 = Array.from(new Uint8Array(hash512Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        // Base64
        const base64 = btoa(unescape(encodeURIComponent(input)));

        setHashResults({ md5, sha256, sha512, base64 });
      }

      addHistory(input);
    } catch (err: any) {
      setError(err.message || 'Parsing error. Check your input.');
    }
  };

  const handleCopy = (text: string, field?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (field) {
      setCopiedHashField(field);
      setTimeout(() => setCopiedHashField(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useKeyboardShortcuts({
    onExecute: handleExecute,
    onCopy: () => {
      if (activeTab === 'hash' && hashResults) {
        handleCopy(hashResults.sha256, 'sha256');
      } else if (output) {
        handleCopy(output);
      }
    }
  });

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3 flex justify-center items-center gap-3" style={{ textShadow: '3px 3px 0px #219ebc' }}>
          <Code className="w-10 h-10 stroke-[3px] text-summer-tiger" /> Free Online Developer Toolkit
        </h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Essential engineering utilities available online for free.</p>
      </header>

      {/* TABBED INTERFACE */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(['jwt', 'cron', 'svg2jsx', 'hash'] as Tab[]).map((tab) => (
          <Link 
            key={tab} href={`/tools/dev-toolkit/${tab}`}
            className={`px-4 py-2 md:px-6 md:py-3 border-[4px] border-summer-space font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-sm flex items-center gap-2 ${
              activeTab === tab ? 'bg-summer-sky text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
            }`}
          >
            {tab === 'jwt' && <ShieldAlert className="w-4 h-4" />}
            {tab === 'cron' && <Clock className="w-4 h-4" />}
            {tab === 'svg2jsx' && <FileCode2 className="w-4 h-4" />}
            {tab === 'hash' && <Lock className="w-4 h-4" />}
            {tab.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* DUAL EDITOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT PANEL: INPUT */}
        <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[600px]">
          <div className="p-4 bg-summer-tiger border-b-[4px] border-summer-space flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-summer-space flex items-center gap-2">Input Payload</span>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => {
                  setInput(getExampleData());
                  setOutput('');
                  setError('');
                  setHashResults(null);
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
                            setHashResults(null);
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

              <button onClick={() => { setInput(''); setOutput(''); setError(''); setHashResults(null); }} className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space">Clear</button>
            </div>
          </div>
          
          {activeTab === 'svg2jsx' && (
            <div className="bg-white border-b-[3px] border-summer-space p-2 flex gap-4">
               <label className="flex items-center gap-2 text-xs font-black uppercase text-summer-space cursor-pointer">
                 <input type="checkbox" checked={svgOptions.functional} onChange={() => setSvgOptions(p => ({...p, functional: !p.functional}))} className="w-4 h-4 accent-summer-space" /> Functional Component
               </label>
               <label className="flex items-center gap-2 text-xs font-black uppercase text-summer-space cursor-pointer">
                 <input type="checkbox" checked={svgOptions.currentColor} onChange={() => setSvgOptions(p => ({...p, currentColor: !p.currentColor}))} className="w-4 h-4 accent-summer-space" /> currentColor
               </label>
               <label className="flex items-center gap-2 text-xs font-black uppercase text-summer-space cursor-pointer">
                 <input type="checkbox" checked={svgOptions.tailwind} onChange={() => setSvgOptions(p => ({...p, tailwind: !p.tailwind}))} className="w-4 h-4 accent-summer-space" /> Tailwind Classes
               </label>
            </div>
          )}

          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={(() => {
              switch (activeTab) {
                case 'jwt': return 'eyJhbGciOiJIUzI1NiIsInR5cCI... (Paste JWT here)';
                case 'cron': return '0 22 * * 1-5 (Paste Cron string here)';
                case 'svg2jsx': return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M12 2L2 22h20L12 2z"/>\n</svg>';
                case 'hash': return 'The quick brown fox jumps over the lazy dog';
                default: return 'Waiting for input...';
              }
            })()}
            className="flex-1 p-6 md:p-8 resize-none focus:outline-none font-mono text-sm bg-zinc-50 text-zinc-800 placeholder-zinc-400"
            spellCheck="false"
          />
        </div>

        {/* RIGHT PANEL: OUTPUT */}
        <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[600px] relative overflow-hidden">
          <div className="p-4 bg-summer-sea border-b-[4px] border-summer-space flex justify-between items-center h-[60px] shrink-0">
            <span className="font-black uppercase tracking-widest text-summer-space flex items-center gap-2">Generated Output</span>
            {output && activeTab !== 'hash' && (
              <button onClick={() => handleCopy(output)} className={`flex items-center gap-1 border-[2px] border-summer-space px-2 py-1 text-xs font-black uppercase transition-colors ${copied ? 'bg-emerald-400 text-summer-space' : 'bg-white hover:bg-summer-amber'}`}>
                {copied ? <Check className="w-3 h-3 text-summer-space" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-zinc-800 text-green-400 font-mono text-sm p-4 overflow-y-auto break-words relative">
            {error ? (
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" /> <span>{error}</span>
              </div>
            ) : activeTab === 'hash' && hashResults ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">MD5</span>
                    <button 
                      onClick={() => handleCopy(hashResults.md5, 'md5')} 
                      className={`text-xs flex items-center gap-1 font-bold uppercase transition-colors ${copiedHashField === 'md5' ? 'text-emerald-400 font-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {copiedHashField === 'md5' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHashField === 'md5' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-zinc-900 p-2 text-white break-all">{hashResults.md5}</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">SHA-256</span>
                    <button 
                      onClick={() => handleCopy(hashResults.sha256, 'sha256')} 
                      className={`text-xs flex items-center gap-1 font-bold uppercase transition-colors ${copiedHashField === 'sha256' ? 'text-emerald-400 font-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {copiedHashField === 'sha256' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHashField === 'sha256' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-zinc-900 p-2 text-white break-all">{hashResults.sha256}</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">SHA-512</span>
                    <button 
                      onClick={() => handleCopy(hashResults.sha512, 'sha512')} 
                      className={`text-xs flex items-center gap-1 font-bold uppercase transition-colors ${copiedHashField === 'sha512' ? 'text-emerald-400 font-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {copiedHashField === 'sha512' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHashField === 'sha512' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-zinc-900 p-2 text-white break-all">{hashResults.sha512}</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">Base64</span>
                    <button 
                      onClick={() => handleCopy(hashResults.base64, 'base64')} 
                      className={`text-xs flex items-center gap-1 font-bold uppercase transition-colors ${copiedHashField === 'base64' ? 'text-emerald-400 font-black' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {copiedHashField === 'base64' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHashField === 'base64' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-zinc-900 p-2 text-white break-all">{hashResults.base64}</div>
                </div>
              </div>
            ) : output ? (
              <div className="space-y-4">
                {activeTab === 'jwt' && jwtStatus && (
                  <div className={`p-2 border-[2px] font-black uppercase text-xs tracking-widest ${jwtStatus.isExpired ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-emerald-500 text-emerald-500 bg-emerald-500/10'}`}>
                    {jwtStatus.isExpired ? `Expired on ${jwtStatus.expDate}` : `Valid until ${jwtStatus.expDate}`}
                  </div>
                )}
                
                {activeTab === 'cron' && (
                  <div className="bg-zinc-900 p-4 border-l-[4px] border-summer-amber text-summer-amber font-bold text-lg mb-4">
                    "{output}"
                  </div>
                )}
                
                {activeTab === 'cron' && cronDates.length > 0 ? (
                  <div>
                    <h4 className="text-zinc-400 font-black text-xs uppercase tracking-widest mb-2">Next 5 Executions (Local Time)</h4>
                    <ul className="space-y-1">
                      {cronDates.map((d, i) => <li key={i} className="text-white">- {d}</li>)}
                    </ul>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                <Code className="w-24 h-24 text-green-400 mb-4" />
                <span className="text-green-400 font-black uppercase tracking-widest text-xl">Awaiting Input...</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* EXECUTE BUTTON */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleExecute}
          className="bg-summer-amber hover:bg-summer-tiger text-summer-space px-12 py-5 border-[4px] border-summer-space font-black uppercase tracking-widest text-xl transition-all shadow-[6px_6px_0px_#023047] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-3"
        >
          <Settings2 className="w-6 h-6 stroke-[3px]" /> Execute
        </button>
      </div>

      {/* SEO content removed; now rendered by server in page.tsx */}

    </div>
  );
}
