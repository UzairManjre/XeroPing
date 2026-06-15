'use client';

import { useState, useMemo } from 'react';
import { Scissors, Check } from 'lucide-react';
import AdUnit from '@/components/AdUnit';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLocalHistory } from '@/hooks/useLocalHistory';

export default function TextSplitter() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  const { history, addHistory, clearHistory } = useLocalHistory('text_splitter');

  const getExampleData = () => {
    return 'Paragraph One: Lorem ipsum dolor sit amet. \n\nParagraph Two: Consectetur adipiscing elit. \n\nParagraph Three: Sed do eiusmod tempor incididunt ut labore.';
  };

  // Split Options
  const [splitMode, setSplitMode] = useState<'symbol' | 'regex' | 'length'>('symbol');
  const [splitSymbol, setSplitSymbol] = useState('');
  const [splitRegex, setSplitRegex] = useState('\\s+');
  const [splitLength, setSplitLength] = useState<number>(16);

  // Output Options
  const [outSeparator, setOutSeparator] = useState('\\n');
  const [charBefore, setCharBefore] = useState('');
  const [charAfter, setCharAfter] = useState('');

  const outputText = useMemo(() => {
    if (!inputText) return '';
    
    let chunks: string[] = [];
    if (splitMode === 'symbol') {
      const sep = splitSymbol === '' ? ' ' : splitSymbol.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      chunks = inputText.split(sep);
    } else if (splitMode === 'regex') {
      try {
        let rxString = splitRegex;
        if (rxString.startsWith('/') && rxString.endsWith('/')) {
          rxString = rxString.slice(1, -1);
        }
        const rx = new RegExp(rxString || '\\s+');
        chunks = inputText.split(rx);
      } catch {
        chunks = [inputText];
      }
    } else if (splitMode === 'length') {
      const len = splitLength > 0 ? splitLength : 16;
      const regex = new RegExp(`.{1,${len}}`, 'g');
      chunks = inputText.match(regex) || [];
    }

    const realOutSep = outSeparator.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    const realBefore = charBefore.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    const realAfter = charAfter.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    
    return chunks.map(c => `${realBefore}${c}${realAfter}`).join(realOutSep);
  }, [inputText, splitMode, splitSymbol, splitRegex, splitLength, outSeparator, charBefore, charAfter]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addHistory(inputText);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'split_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addHistory(inputText);
  };

  useKeyboardShortcuts({
    onExecute: () => {
      if (inputText) {
        addHistory(inputText);
      }
    },
    onCopy: handleCopy
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3 flex justify-center items-center gap-3" style={{ textShadow: '3px 3px 0px #219ebc' }}>
          <Scissors className="w-10 h-10 stroke-[3px] text-summer-tiger" /> Free Online Text Splitter
        </h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Instantly chunk and slice massive strings online.</p>
      </header>

      {/* DUAL TEXTAREA LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        
        {/* INPUT PANEL */}
        <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[400px]">
          <div className="p-3 bg-[#4d7398] border-b-[4px] border-summer-space flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-white text-sm">Input Text</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setInputText(getExampleData())} 
                className="text-xs font-bold uppercase text-white/80 hover:text-white hover:underline"
              >
                Load Example
              </button>

              {inputText === '' && history.length > 0 && (
                <button 
                  onClick={() => setInputText(history[0].input)} 
                  className="text-xs font-black uppercase text-emerald-200 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-500 px-1 py-0.5 rounded transition-colors"
                >
                  Restore Last
                </button>
              )}

              {history.length > 0 && (
                <div className="relative group">
                  <button className="text-xs font-bold uppercase text-white/80 hover:text-white flex items-center gap-1">
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
                          onClick={() => setInputText(item.input)}
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
            </div>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-6 md:p-8 resize-none focus:outline-none font-mono text-sm bg-[#5c85aa] text-white placeholder:text-white/60"
            spellCheck="false"
          />
          <div className="flex border-t-[4px] border-summer-space bg-[#3a5a78]">
            <label className="flex-1 text-center py-2 text-white font-bold text-sm hover:bg-[#2b445a] cursor-pointer border-r-[2px] border-summer-space">
              Import from file
              <input type="file" className="hidden" accept=".txt,.json,.csv,.md" onChange={handleImport} />
            </label>
            <button className="flex-1 text-center py-2 text-white font-bold text-sm hover:bg-[#2b445a] border-r-[2px] border-summer-space" onClick={() => {
                const blob = new Blob([inputText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'input_text.txt';
                a.click();
                URL.revokeObjectURL(url);
            }}>
              Save as...
            </button>
            <button className="flex-1 text-center py-2 text-white font-bold text-sm hover:bg-[#2b445a]" onClick={() => navigator.clipboard.writeText(inputText)}>
              Copy to clipboard
            </button>
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className="border-[4px] border-summer-space bg-white shadow-brutal flex flex-col h-[400px]">
          <div className="p-3 bg-[#4d7398] border-b-[4px] border-summer-space flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-white text-sm">Text Pieces</span>
          </div>
          <div className="flex-1 relative bg-[#5c85aa]">
            {!outputText && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                <Scissors className="w-24 h-24 text-white mb-4" />
                <span className="text-white font-black uppercase tracking-widest text-xl">Awaiting Text...</span>
              </div>
            )}
            <textarea 
              readOnly
              value={outputText}
              className="w-full h-full p-6 md:p-8 resize-none focus:outline-none font-mono text-sm bg-transparent text-white"
              spellCheck="false"
            />
          </div>
          <div className="flex border-t-[4px] border-summer-space bg-[#3a5a78]">
            <button className="flex-1 text-center py-2 text-white font-bold text-sm hover:bg-[#2b445a] border-r-[2px] border-summer-space">
              Chain with...
            </button>
            <button className="flex-1 text-center py-2 text-white font-bold text-sm hover:bg-[#2b445a] border-r-[2px] border-summer-space" onClick={handleDownload}>
              Save as...
            </button>
            <button className="flex-1 text-center py-2 text-white font-bold text-sm hover:bg-[#2b445a] flex justify-center items-center gap-1" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        </div>

      </div>

      {/* OPTIONS SECTION */}
      <div className="border-[4px] border-summer-space bg-white shadow-brutal p-6 flex flex-col lg:flex-row gap-8">
        
        {/* Split Separator Options */}
        <div className="flex-1">
          <h3 className="font-black uppercase tracking-widest text-summer-space mb-4 flex items-center gap-2">
            Tool Options
          </h3>
          <h4 className="font-bold text-lg text-summer-space mb-4">Split Separator Options</h4>
          
          <div className="space-y-4">
            {/* Symbol */}
            <div>
              <label className="flex items-center gap-2 font-bold text-summer-space cursor-pointer mb-2">
                <input 
                  type="radio" 
                  name="splitMode" 
                  checked={splitMode === 'symbol'} 
                  onChange={() => setSplitMode('symbol')}
                  className="w-4 h-4 accent-summer-space"
                /> 
                Use a Symbol for Splitting
              </label>
              <div className="pl-6">
                <input 
                  type="text" 
                  value={splitSymbol}
                  onChange={(e) => setSplitSymbol(e.target.value)}
                  disabled={splitMode !== 'symbol'}
                  className="w-full max-w-[250px] p-2 border-[2px] border-summer-space focus:outline-none focus:bg-summer-sky disabled:opacity-50"
                />
                <p className="text-xs text-summer-space/70 mt-1 max-w-[250px]">Character that will be used to break text into parts. (Space by default.)</p>
              </div>
            </div>

            {/* Regex */}
            <div>
              <label className="flex items-center gap-2 font-bold text-summer-space cursor-pointer mb-2">
                <input 
                  type="radio" 
                  name="splitMode" 
                  checked={splitMode === 'regex'} 
                  onChange={() => setSplitMode('regex')}
                  className="w-4 h-4 accent-summer-space"
                /> 
                Use a Regex for Splitting
              </label>
              <div className="pl-6">
                <input 
                  type="text" 
                  value={splitRegex}
                  onChange={(e) => setSplitRegex(e.target.value)}
                  disabled={splitMode !== 'regex'}
                  className="w-full max-w-[250px] p-2 border-[2px] border-summer-space focus:outline-none focus:bg-summer-sky disabled:opacity-50 font-mono text-sm"
                />
                <p className="text-xs text-summer-space/70 mt-1 max-w-[250px]">Regular expression that will be used to break text into parts. (Multiple spaces by default.)</p>
              </div>
            </div>

            {/* Length */}
            <div>
              <label className="flex items-center gap-2 font-bold text-summer-space cursor-pointer mb-2">
                <input 
                  type="radio" 
                  name="splitMode" 
                  checked={splitMode === 'length'} 
                  onChange={() => setSplitMode('length')}
                  className="w-4 h-4 accent-summer-space"
                /> 
                Use Length for Splitting
              </label>
              <div className="pl-6">
                <input 
                  type="number" 
                  min="1"
                  value={splitLength}
                  onChange={(e) => setSplitLength(parseInt(e.target.value) || 1)}
                  disabled={splitMode !== 'length'}
                  className="w-full max-w-[250px] p-2 border-[2px] border-summer-space focus:outline-none focus:bg-summer-sky disabled:opacity-50"
                />
                <p className="text-xs text-summer-space/70 mt-1 max-w-[250px]">Number of symbols that will be in each chunk.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Output Separator Options */}
        <div className="flex-1 lg:border-l-[4px] lg:border-summer-space lg:pl-8">
          <h4 className="font-bold text-lg text-summer-space mb-4 pt-[32px] lg:pt-0">Output Separator Options</h4>
          
          <div className="space-y-6">
            <div>
              <input 
                type="text" 
                value={outSeparator}
                onChange={(e) => setOutSeparator(e.target.value)}
                className="w-full max-w-[250px] p-2 border-[2px] border-summer-space focus:outline-none focus:bg-summer-sky font-mono text-sm"
              />
              <p className="text-xs text-summer-space/70 mt-1 max-w-[250px]">Character that will be put between the split chunks. (It's newline "\n" by default.)</p>
            </div>

            <div className="flex gap-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Char Before Chunk"
                  value={charBefore}
                  onChange={(e) => setCharBefore(e.target.value)}
                  className="w-[120px] p-2 border-[2px] border-summer-space focus:outline-none focus:bg-summer-sky text-sm"
                />
                <p className="text-xs text-summer-space/70 mt-1 max-w-[120px]">Character before each chunk.</p>
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Char After Chunk"
                  value={charAfter}
                  onChange={(e) => setCharAfter(e.target.value)}
                  className="w-[120px] p-2 border-[2px] border-summer-space focus:outline-none focus:bg-summer-sky text-sm"
                />
                <p className="text-xs text-summer-space/70 mt-1 max-w-[120px]">Character after each chunk.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SEO content removed; now rendered by server in page.tsx */}

    </div>
  );
}
