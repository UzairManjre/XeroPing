'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ShieldAlert, Download, Copy, Check, Settings2, ShieldCheck, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import AdUnit from '@/components/AdUnit';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLocalHistory } from '@/hooks/useLocalHistory';
import SparkMD5 from 'spark-md5';

// ReDoS guard: max input size before regex is applied (500 KB)
const MAX_REDACT_INPUT_BYTES = 500 * 1024;

type RedactOptions = {
  emails: boolean;
  creditCards: boolean;
  ips: boolean;
  phones: boolean;
  tokens: boolean;
};

type CustomRule = {
  id: string;
  name: string;
  pattern: string;
  isRegex: boolean;
};

type MaskingStrategy = 'placeholder' | 'mask' | 'hash';
type OutputMode = 'redacted' | 'audit';

export default function TextRedactor() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(0);
  const [sizeError, setSizeError] = useState('');

  // Dynamically loaded DOMPurify (client-only)
  const purifyRef = useRef<any>(null);
  useEffect(() => {
    import('dompurify').then(mod => { purifyRef.current = mod.default; });
  }, []);

  // Overhauled states
  const [maskingStrategy, setMaskingStrategy] = useState<MaskingStrategy>('placeholder');
  const [outputMode, setOutputMode] = useState<OutputMode>('redacted');
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleIsRegex, setNewRuleIsRegex] = useState(false);

  const { history, addHistory, clearHistory } = useLocalHistory('text_redactor');

  const getExampleData = () => {
    return '[2026-06-15 00:10:00] ERROR auth: Failed login attempt for user admin@Zero Ping.net from IP 192.168.1.105. AWS Key AKIAIOSFODNN7EXAMPLE and Bearer Token eyJhbGciOiJIUzI1NiIsInR5cCI.xxxx.xxxx were exposed. Call support at +1 (555) 019-2831. Visa ending in 4111-2222-3333-4444.';
  };

  const [options, setOptions] = useState<RedactOptions>({
    emails: true,
    creditCards: true,
    ips: true,
    phones: false,
    tokens: true,
  });

  const handleToggle = (key: keyof RedactOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addCustomRule = () => {
    if (!newRuleName.trim() || !newRulePattern.trim()) return;
    const rule: CustomRule = {
      id: Math.random().toString(36).substring(7),
      name: newRuleName.trim(),
      pattern: newRulePattern.trim(),
      isRegex: newRuleIsRegex
    };
    setCustomRules(prev => [...prev, rule]);
    setNewRuleName('');
    setNewRulePattern('');
  };

  const deleteCustomRule = (id: string) => {
    setCustomRules(prev => prev.filter(r => r.id !== id));
  };

  // Redaction masking helper
  const maskValue = (val: string, label: string): string => {
    if (maskingStrategy === 'placeholder') {
      return `[REDACTED_${label.toUpperCase()}]`;
    }
    if (maskingStrategy === 'hash') {
      return `[HASH_${SparkMD5.hash(val).substring(0, 10)}]`;
    }
    // Mask characters strategy (keep start and end, replace center)
    if (val.length <= 4) return '****';
    const keep = Math.min(2, Math.floor(val.length / 4));
    return val.substring(0, keep) + '****' + val.substring(val.length - keep);
  };

  const handleRedact = () => {
    // ReDoS guard: reject inputs larger than 500 KB
    const byteLen = new Blob([input]).size;
    if (byteLen > MAX_REDACT_INPUT_BYTES) {
      setSizeError(`Input too large (${(byteLen / 1024).toFixed(0)} KB). Please keep input under 500 KB to prevent browser freeze.`);
      return;
    }
    setSizeError('');
    let result = input;
    let matchCount = 0;

    const applyRedaction = (regex: RegExp, label: string) => {
      const matches = result.match(regex);
      if (matches) {
        matchCount += matches.length;
        result = result.replace(regex, (match) => maskValue(match, label));
      }
    };

    if (options.emails) {
      applyRedaction(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'EMAIL');
    }
    
    if (options.creditCards) {
      applyRedaction(/\b(?:\d[ -]*?){13,16}\b/g, 'CC');
    }

    if (options.ips) {
      applyRedaction(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, 'IP');
      applyRedaction(/(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}/g, 'IPV6');
    }

    if (options.phones) {
      applyRedaction(/\b(?:\+?\d{1,3}[-. \s]?)?\(?\d{3}\)?[-. \s]?\d{3}[-. \s]?\d{4}\b/g, 'PHONE');
    }

    if (options.tokens) {
      applyRedaction(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+={0,2}/g, 'TOKEN');
      applyRedaction(/eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, 'JWT');
      applyRedaction(/(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])/g, 'AWS_KEY');
    }

    // Apply custom rules
    for (const rule of customRules) {
      try {
        const regex = rule.isRegex 
          ? new RegExp(rule.pattern, 'g')
          : new RegExp(rule.pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        applyRedaction(regex, rule.name);
      } catch (err) {
        console.error("Custom rule evaluation failed", err);
      }
    }

    setOutput(result);
    setStats(matchCount);
    addHistory(input);
  };

  // Compile and sanitize HTML for dynamic Audit View highlighting matches
  const auditViewHtml = useMemo(() => {
    if (!input) return '';
    let result = input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const wrapMatch = (val: string, label: string) => {
      return `<mark class="bg-rose-500/20 text-rose-300 border border-rose-500 rounded px-1 font-bold text-xs select-all inline-block" title="${label}">${val}<span class="ml-1 text-[8px] bg-rose-500 text-white px-1 py-0.5 rounded font-black">${label.toUpperCase()}</span></mark>`;
    };

    const runHighlight = (regex: RegExp, label: string) => {
      // Find all matches first, sort by length desc to avoid inner replacements
      const matches = result.match(regex);
      if (!matches) return;
      
      const uniqueMatches = Array.from(new Set(matches)).sort((a, b) => b.length - a.length);
      for (const m of uniqueMatches) {
        // Escape match regex characters
        const escaped = m.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const rx = new RegExp(escaped, 'g');
        result = result.replace(rx, wrapMatch(m, label));
      }
    };

    if (options.emails) {
      runHighlight(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'EMAIL');
    }
    if (options.creditCards) {
      runHighlight(/\b(?:\d[ -]*?){13,16}\b/g, 'CC');
    }
    if (options.ips) {
      runHighlight(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, 'IP');
      runHighlight(/(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}/g, 'IPV6');
    }
    if (options.phones) {
      runHighlight(/\b(?:\+?\d{1,3}[-. \s]?)?\(?\d{3}\)?[-. \s]?\d{3}[-. \s]?\d{4}\b/g, 'PHONE');
    }
    if (options.tokens) {
      runHighlight(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+={0,2}/g, 'TOKEN');
      runHighlight(/eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, 'JWT');
      runHighlight(/(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])/g, 'AWS_KEY');
    }

    for (const rule of customRules) {
      try {
        const regex = rule.isRegex 
          ? new RegExp(rule.pattern, 'g')
          : new RegExp(rule.pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        runHighlight(regex, rule.name);
      } catch {}
    }

    // Sanitize with DOMPurify before injecting into DOM
    // Only allow the specific <mark> and <span> tags generated above
    if (purifyRef.current) {
      return purifyRef.current.sanitize(result, {
        ALLOWED_TAGS: ['mark', 'span', 'br'],
        ALLOWED_ATTR: ['class', 'title'],
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['svg', 'math', 'script', 'style', 'link', 'iframe', 'object'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'href', 'src'],
      });
    }
    return result;
  }, [input, options, customRules]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useKeyboardShortcuts({
    onExecute: handleRedact,
    onCopy: handleCopy
  });

  const downloadText = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanitized_log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center animate-in fade-in">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3 flex justify-center items-center gap-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>
          <ShieldAlert className="w-10 h-10 stroke-[3px] text-summer-tiger" /> Free Online Text Redactor
        </h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Sanitize API keys, emails, and phone numbers online for free. Audited visual highlights.</p>
      </header>

      {/* SIZE GUARD ERROR BANNER */}
      {sizeError && (
        <div className="mb-6 max-w-5xl mx-auto p-4 bg-rose-500 border-[4px] border-summer-space shadow-brutal flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-white shrink-0" />
          <p className="text-white font-bold text-sm">{sizeError}</p>
        </div>
      )}

      {/* STRATEGY & RULE HEADER PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
        {/* Detectors Toggles */}
        <div className="bg-summer-amber border-[4px] border-summer-space p-6 shadow-brutal flex flex-col justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-summer-space border-b-[2px] border-summer-space pb-1 mb-4">Auto Detectors</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(options) as Array<keyof RedactOptions>).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer bg-white border-[2px] border-summer-space px-3 py-1.5 hover:bg-summer-sky transition-colors select-none text-xs">
                <input 
                  type="checkbox" 
                  checked={options[key]} 
                  onChange={() => handleToggle(key)}
                  className="w-4 h-4 accent-summer-space cursor-pointer"
                />
                <span className="font-black uppercase tracking-widest text-summer-space">
                  {key === 'ips' ? 'IPs' : key === 'creditCards' ? 'Cards' : key === 'tokens' ? 'Tokens' : key}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Masking strategy config */}
        <div className="bg-summer-amber border-[4px] border-summer-space p-6 shadow-brutal flex flex-col justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-summer-space border-b-[2px] border-summer-space pb-1 mb-4">Redaction Mask Strategy</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['placeholder', 'mask', 'hash'] as const).map(strategy => (
              <button 
                key={strategy}
                onClick={() => setMaskingStrategy(strategy)}
                className={`py-2 border-[2px] border-summer-space font-black uppercase text-xs transition-colors ${
                  maskingStrategy === strategy ? 'bg-summer-space text-white' : 'bg-white hover:bg-summer-sky text-summer-space'
                }`}
              >
                {strategy === 'placeholder' ? 'Placeholder' : strategy === 'mask' ? 'Character Mask' : 'SHA Hash'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DUAL TEXTAREA & RULES LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        
        {/* LEFT PANEL: INPUT & CUSTOM RULES */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[500px]">
            <div className="p-4 bg-summer-tiger border-b-[4px] border-summer-space flex justify-between items-center">
              <span className="font-black uppercase tracking-widest text-summer-space flex items-center gap-2">Raw Logs / Data</span>
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => {
                    setInput(getExampleData());
                    setOutput('');
                    setStats(0);
                  }} 
                  className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space hover:underline"
                >
                  Load Example
                </button>
                <button onClick={() => { setInput(''); setOutput(''); setStats(0); }} className="text-xs font-bold uppercase text-summer-space/80 hover:text-summer-space">Clear</button>
              </div>
            </div>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your unredacted server logs, JSON payload, or document here..."
              className="flex-grow p-6 md:p-8 resize-none focus:outline-none font-mono text-sm bg-zinc-50 text-zinc-800 focus:bg-white"
              spellCheck="false"
            />
          </div>

          {/* CUSTOM RULES MANAGER */}
          <div className="bg-white border-[4px] border-summer-space p-6 shadow-brutal space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-summer-space border-b-[2px] border-summer-space pb-1">Custom Redaction Rules</h3>
            
            {/* Rule Addition Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input 
                type="text" placeholder="Rule name (e.g. USERNAME)" 
                value={newRuleName} onChange={e => setNewRuleName(e.target.value)}
                className="p-2 border-[2px] border-summer-space text-xs font-bold"
              />
              <input 
                type="text" placeholder="Word or RegEx pattern" 
                value={newRulePattern} onChange={e => setNewRulePattern(e.target.value)}
                className="p-2 border-[2px] border-summer-space text-xs font-mono"
              />
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-100 border-[2px] border-summer-space px-2 text-xs font-black uppercase tracking-wider text-summer-space hover:bg-summer-sky select-none flex-grow">
                  <input 
                    type="checkbox" checked={newRuleIsRegex} 
                    onChange={() => setNewRuleIsRegex(!newRuleIsRegex)} 
                    className="accent-summer-space w-4.5 h-4.5"
                  />
                  Regex
                </label>
                <button 
                  onClick={addCustomRule}
                  className="bg-summer-space text-white px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-summer-tiger hover:text-summer-space transition-colors border-[2px] border-summer-space"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Custom Rules list */}
            {customRules.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border-t-[2px] border-summer-space pt-4">
                {customRules.map(rule => (
                  <div key={rule.id} className="flex justify-between items-center bg-zinc-50 p-2 border border-zinc-200 text-xs">
                    <div className="truncate">
                      <span className="font-black text-summer-space uppercase mr-2 bg-summer-sky/35 px-1 py-0.5 border border-summer-space">{rule.name}</span>
                      <span className="font-mono text-zinc-600 truncate">{rule.pattern}</span>
                      {rule.isRegex && <span className="ml-2 text-[9px] text-zinc-400 font-bold uppercase">(Regex)</span>}
                    </div>
                    <button onClick={() => deleteCustomRule(rule.id)} className="text-rose-500 hover:text-rose-700 font-bold ml-4">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: OUTPUT & AUDIT */}
        <div className="lg:col-span-6">
          <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[500px]">
            <div className="p-4 bg-summer-sea border-b-[4px] border-summer-space flex justify-between items-center h-[60px] shrink-0">
              <div className="flex items-center gap-4 text-xs font-black">
                {/* Mode Selectors */}
                <button 
                  onClick={() => setOutputMode('redacted')}
                  className={`px-3 py-1 border-[2px] border-summer-space uppercase flex items-center gap-1.5 transition-colors ${
                    outputMode === 'redacted' ? 'bg-summer-space text-white' : 'bg-white text-summer-space'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> Redacted Text
                </button>
                <button 
                  onClick={() => setOutputMode('audit')}
                  className={`px-3 py-1 border-[2px] border-summer-space uppercase flex items-center gap-1.5 transition-colors ${
                    outputMode === 'audit' ? 'bg-summer-space text-white' : 'bg-white text-summer-space'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Audit View
                </button>
              </div>

              {output && outputMode === 'redacted' && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className={`flex items-center gap-1 border-[2px] border-summer-space px-2 py-1 text-xs font-black uppercase transition-colors ${copied ? 'bg-emerald-400 text-summer-space' : 'bg-white hover:bg-summer-amber'}`}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={downloadText} className="flex items-center gap-1 bg-summer-space text-white border-[2px] border-summer-space px-2 py-1 text-xs font-black uppercase hover:bg-summer-tiger hover:text-summer-space transition-colors">
                    <Download className="w-3 h-3" /> Save
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-grow relative bg-zinc-800 text-zinc-300 font-mono text-sm p-4 overflow-auto whitespace-pre-wrap break-words">
              {output ? (
                <>
                  <div className="absolute top-2 right-4 text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 flex items-center gap-2 z-10">
                    <ShieldCheck className="w-4 h-4" /> {stats} Data Points Redacted
                  </div>

                  {outputMode === 'redacted' ? (
                    <div className="mt-8">{output}</div>
                  ) : (
                    /* Audit highlighting layout */
                    <div 
                      className="mt-8 leading-relaxed space-y-2 whitespace-pre-wrap select-text text-zinc-300"
                      dangerouslySetInnerHTML={{ __html: auditViewHtml }}
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                  <ShieldAlert className="w-24 h-24 text-zinc-400 mb-4" />
                  <span className="text-zinc-400 font-black uppercase tracking-widest text-xl">Awaiting Data...</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* EXECUTE BUTTON */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleRedact}
          className="bg-summer-amber hover:bg-summer-tiger text-summer-space px-12 py-5 border-[4px] border-summer-space font-black uppercase tracking-widest text-xl transition-all shadow-[6px_6px_0px_#023047] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-3"
        >
          <Settings2 className="w-6 h-6 stroke-[3px]" /> Execute Sanitization
        </button>
      </div>

      {/* SEO content removed; now rendered by server in page.tsx */}

    </div>
  );
}
