'use client';

import { useState } from 'react';
import { Calculator, Type, Hash, Percent, RotateCw, ArrowRight } from 'lucide-react';

type TabType = 'base' | 'ascii' | 'roman' | 'fraction' | 'degrees';
type BaseType = 'binary' | 'decimal' | 'hexadecimal' | 'octal';

export default function NumberConverterClient() {
  const [activeTab, setActiveTab] = useState<TabType>('base');

  // --- BASE CONVERTER STATE ---
  const [baseFrom, setBaseFrom] = useState<BaseType>('binary');
  const [baseTo, setBaseTo] = useState<BaseType>('decimal');
  const [baseInput, setBaseInput] = useState('1101');

  // --- ASCII STATE ---
  const [asciiMode, setAsciiMode] = useState<'text2bin' | 'bin2text' | 'text2hex' | 'hex2text'>('text2bin');
  const [asciiInput, setAsciiInput] = useState('Hello');

  // --- ROMAN STATE ---
  const [romanMode, setRomanMode] = useState<'num2rom' | 'rom2num'>('num2rom');
  const [romanInput, setRomanInput] = useState('2024');

  // --- FRACTION STATE ---
  const [fractionInput, setFractionInput] = useState('3/4');

  // --- DEGREES STATE ---
  const [degreeMode, setDegreeMode] = useState<'deg2rad' | 'rad2deg'>('deg2rad');
  const [degreeInput, setDegreeInput] = useState('180');
  
  const getBaseRadix = (type: BaseType) => {
    switch(type) {
      case 'binary': return 2;
      case 'octal': return 8;
      case 'decimal': return 10;
      case 'hexadecimal': return 16;
    }
  };

  const calculateBaseConversion = () => {
    if (!baseInput) return { result: '', steps: '', error: '' };
    try {
      const fromRadix = getBaseRadix(baseFrom);
      const toRadix = getBaseRadix(baseTo);
      
      // Parse to decimal first, supporting floats
      let decimalValue = 0;
      const cleanInput = baseInput.trim();
      const isNegative = cleanInput.startsWith('-');
      const absInput = isNegative ? cleanInput.slice(1) : cleanInput;

      if (absInput.includes('.')) {
        const parts = absInput.split('.');
        if (parts.length > 2) throw new Error('Invalid input');
        
        const intStr = parts[0] || '0';
        const fracStr = parts[1] || '';
        
        let intPart = parseInt(intStr, fromRadix);
        if (isNaN(intPart) && intStr !== '0') throw new Error('Invalid input');
        if (isNaN(intPart)) intPart = 0;
        
        let fracPart = 0;
        for (let i = 0; i < fracStr.length; i++) {
          const digit = parseInt(fracStr[i], fromRadix);
          if (isNaN(digit)) throw new Error('Invalid input');
          fracPart += digit / Math.pow(fromRadix, i + 1);
        }
        decimalValue = intPart + fracPart;
      } else {
        decimalValue = parseInt(absInput, fromRadix);
        if (isNaN(decimalValue)) throw new Error('Invalid input for selected base');
      }
      
      if (isNegative) decimalValue = -decimalValue;

      let result = decimalValue.toString(toRadix).toUpperCase();
      
      // Preserve trailing dot if user typed it
      if (baseInput.endsWith('.') && !result.includes('.')) {
        result += '.';
      }

      // Generate steps if converting to decimal
      let steps = '';
      if (baseTo === 'decimal' && baseFrom !== 'decimal') {
        if (!baseInput.includes('.')) {
          const digits = absInput.split('');
          const parts = digits.map((d, i) => {
            const power = digits.length - 1 - i;
            return `${d.toUpperCase()}×${fromRadix}^${power}`;
          });
          steps = `${absInput} = ${parts.join(' + ')} = ${Math.abs(decimalValue)}`;
        } else {
          steps = `Converted floating-point number ${baseInput} from Base ${fromRadix} to Base 10.`;
        }
      } else if (baseFrom === 'decimal' && baseTo !== 'decimal') {
        steps = `Divide integer part by ${toRadix} and multiply fractional part by ${toRadix}.`;
      }

      return { result, steps, error: '' };
    } catch (e: any) {
      return { result: '', steps: '', error: 'Invalid input' };
    }
  };

  const { result: baseResult, steps: baseSteps, error: baseError } = calculateBaseConversion();

  const calculateAscii = () => {
    if (!asciiInput) return '';
    try {
      if (asciiMode === 'text2bin') {
        return asciiInput.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      } else if (asciiMode === 'bin2text') {
        return asciiInput.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
      } else if (asciiMode === 'text2hex') {
        return asciiInput.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
      } else if (asciiMode === 'hex2text') {
        return asciiInput.split(' ').map(h => String.fromCharCode(parseInt(h, 16))).join('');
      }
    } catch { return 'Invalid Input'; }
    return '';
  };

  const calculateRoman = () => {
    if (!romanInput) return '';
    const val = romanInput.toUpperCase();
    if (romanMode === 'num2rom') {
      let num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 3999) return 'Enter number 1-3999';
      const romanMatrix: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
      ];
      let res = '';
      for (const [v, r] of romanMatrix) {
        while (num >= v) { res += r; num -= v; }
      }
      return res;
    } else {
      const romMap: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
      let res = 0;
      for (let i = 0; i < val.length; i++) {
        const cur = romMap[val[i]];
        const next = romMap[val[i + 1]];
        if (!cur) return 'Invalid Roman Numeral';
        if (next && cur < next) { res += next - cur; i++; }
        else { res += cur; }
      }
      return res.toString();
    }
  };

  const calculateFraction = () => {
    if (!fractionInput) return { dec: '', pct: '' };
    if (fractionInput.includes('/')) {
      const [num, den] = fractionInput.split('/').map(Number);
      if (isNaN(num) || isNaN(den) || den === 0) return { dec: 'Err', pct: 'Err' };
      const val = num / den;
      return { dec: val.toString(), pct: (val * 100).toFixed(2) + '%' };
    } else {
      const val = parseFloat(fractionInput);
      if (isNaN(val)) return { dec: 'Err', pct: 'Err' };
      return { dec: val.toString(), pct: (val * 100).toFixed(2) + '%' };
    }
  };

  const calculateDegrees = () => {
    const val = parseFloat(degreeInput);
    if (isNaN(val)) return '';
    if (degreeMode === 'deg2rad') return (val * (Math.PI / 180)).toFixed(6);
    return (val * (180 / Math.PI)).toFixed(6);
  };

  // --- RENDERERS ---
  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-8 border-b-[4px] border-summer-space pb-4">
      {[
        { id: 'base', icon: Hash, label: 'Base Converter' },
        { id: 'ascii', icon: Type, label: 'Text/ASCII' },
        { id: 'roman', icon: Calculator, label: 'Roman Numerals' },
        { id: 'fraction', icon: Percent, label: 'Fractions' },
        { id: 'degrees', icon: RotateCw, label: 'Degrees/Rads' }
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 font-black uppercase tracking-widest text-sm transition-all border-[3px] border-summer-space ${
              isActive 
                ? 'bg-summer-space text-white shadow-brutal translate-y-[-2px]' 
                : 'bg-white text-summer-space hover:bg-summer-sky shadow-sm'
            }`}
          >
            <Icon className="w-4 h-4 stroke-[3px]" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal-lg relative">
      <div className="p-6 border-b-[4px] border-summer-space bg-summer-amber flex items-center gap-3">
        <div className="w-10 h-10 bg-summer-space flex items-center justify-center border-[2px] border-summer-space">
          <Calculator className="w-6 h-6 text-summer-amber stroke-[2.5px]" />
        </div>
        <h2 className="text-2xl font-black text-summer-space uppercase tracking-tight">Interactive Converter</h2>
      </div>

      <div className="p-6 lg:p-8">
        {renderTabs()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CALCULATOR */}
          <div className="lg:col-span-7 space-y-6">
            
            {activeTab === 'base' && (
              <div className="bg-white border-[4px] border-summer-space shadow-brutal p-6 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-summer-space border-b-[3px] border-summer-space pb-2">Base Conversion</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">From</label>
                    <select 
                      value={baseFrom} 
                      onChange={(e) => setBaseFrom(e.target.value as BaseType)}
                      className="w-full p-3 border-[3px] border-summer-space font-bold uppercase focus:outline-none focus:bg-summer-sky transition-colors cursor-pointer appearance-none bg-white"
                    >
                      <option value="binary">Binary (Base 2)</option>
                      <option value="octal">Octal (Base 8)</option>
                      <option value="decimal">Decimal (Base 10)</option>
                      <option value="hexadecimal">Hexadecimal (Base 16)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest mb-2">To</label>
                    <select 
                      value={baseTo} 
                      onChange={(e) => setBaseTo(e.target.value as BaseType)}
                      className="w-full p-3 border-[3px] border-summer-space font-bold uppercase focus:outline-none focus:bg-summer-sky transition-colors cursor-pointer appearance-none bg-white"
                    >
                      <option value="binary">Binary (Base 2)</option>
                      <option value="octal">Octal (Base 8)</option>
                      <option value="decimal">Decimal (Base 10)</option>
                      <option value="hexadecimal">Hexadecimal (Base 16)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-2">Enter {baseFrom} number</label>
                  <input
                    type="text"
                    value={baseInput}
                    onChange={(e) => setBaseInput(e.target.value)}
                    className="w-full p-4 border-[3px] border-summer-space font-mono text-xl font-bold uppercase focus:outline-none focus:bg-summer-sky transition-colors"
                    placeholder={`e.g. ${baseFrom === 'binary' ? '1010' : baseFrom === 'hexadecimal' ? '1A3F' : '42'}`}
                  />
                  {baseError && <p className="text-rose-600 font-bold text-sm mt-2 uppercase tracking-wide">{baseError}</p>}
                </div>

                <div className="pt-4 border-t-[3px] border-summer-space">
                  <label className="block text-sm font-black text-summer-space/70 uppercase tracking-widest mb-2">Converted {baseTo} Result</label>
                  <div className="w-full p-4 bg-summer-sea border-[3px] border-summer-space font-mono text-3xl font-black text-summer-space overflow-x-auto">
                    {baseResult || '-'}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'ascii' && (
              <div className="bg-white border-[4px] border-summer-space shadow-brutal p-6 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-summer-space border-b-[3px] border-summer-space pb-2">ASCII & Text</h3>
                <select value={asciiMode} onChange={e=>setAsciiMode(e.target.value as any)} className="w-full p-3 border-[3px] border-summer-space font-bold uppercase cursor-pointer bg-white">
                  <option value="text2bin">Text to Binary</option>
                  <option value="bin2text">Binary to Text</option>
                  <option value="text2hex">Text to Hex</option>
                  <option value="hex2text">Hex to Text</option>
                </select>
                <textarea value={asciiInput} onChange={e=>setAsciiInput(e.target.value)} className="w-full p-4 border-[3px] border-summer-space font-mono text-lg font-bold min-h-[100px]" placeholder="Input..." />
                <div className="pt-4 border-t-[3px] border-summer-space">
                  <label className="block text-sm font-black text-summer-space/70 uppercase tracking-widest mb-2">Output Result</label>
                  <div className="w-full p-4 bg-summer-sea border-[3px] border-summer-space font-mono text-xl font-bold text-summer-space min-h-[100px] break-all">
                    {calculateAscii() || '-'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roman' && (
              <div className="bg-white border-[4px] border-summer-space shadow-brutal p-6 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-summer-space border-b-[3px] border-summer-space pb-2">Roman Numerals</h3>
                <select value={romanMode} onChange={e=>setRomanMode(e.target.value as any)} className="w-full p-3 border-[3px] border-summer-space font-bold uppercase cursor-pointer bg-white">
                  <option value="num2rom">Number to Roman</option>
                  <option value="rom2num">Roman to Number</option>
                </select>
                <input type="text" value={romanInput} onChange={e=>setRomanInput(e.target.value)} className="w-full p-4 border-[3px] border-summer-space font-mono text-xl font-bold uppercase" placeholder="Input..." />
                <div className="pt-4 border-t-[3px] border-summer-space">
                  <div className="w-full p-4 bg-summer-sea border-[3px] border-summer-space font-mono text-3xl font-black text-summer-space">
                    {calculateRoman() || '-'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fraction' && (
              <div className="bg-white border-[4px] border-summer-space shadow-brutal p-6 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-summer-space border-b-[3px] border-summer-space pb-2">Fractions & Decimals</h3>
                <input type="text" value={fractionInput} onChange={e=>setFractionInput(e.target.value)} className="w-full p-4 border-[3px] border-summer-space font-mono text-xl font-bold uppercase" placeholder="e.g. 3/4 or 0.75" />
                <div className="pt-4 border-t-[3px] border-summer-space space-y-4">
                  <div className="w-full p-4 bg-summer-sea border-[3px] border-summer-space font-mono text-2xl font-black text-summer-space">
                    Decimal: {calculateFraction().dec || '-'}
                  </div>
                  <div className="w-full p-4 bg-summer-tiger/20 border-[3px] border-summer-space font-mono text-2xl font-black text-summer-space">
                    Percent: {calculateFraction().pct || '-'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'degrees' && (
              <div className="bg-white border-[4px] border-summer-space shadow-brutal p-6 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-summer-space border-b-[3px] border-summer-space pb-2">Degrees & Radians</h3>
                <select value={degreeMode} onChange={e=>setDegreeMode(e.target.value as any)} className="w-full p-3 border-[3px] border-summer-space font-bold uppercase cursor-pointer bg-white">
                  <option value="deg2rad">Degrees to Radians</option>
                  <option value="rad2deg">Radians to Degrees</option>
                </select>
                <input type="number" value={degreeInput} onChange={e=>setDegreeInput(e.target.value)} className="w-full p-4 border-[3px] border-summer-space font-mono text-xl font-bold uppercase" placeholder="Input..." />
                <div className="pt-4 border-t-[3px] border-summer-space">
                  <div className="w-full p-4 bg-summer-sea border-[3px] border-summer-space font-mono text-3xl font-black text-summer-space">
                    {calculateDegrees() || '-'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: EDUCATIONAL / STEPS */}
          <div className="lg:col-span-5 space-y-6">
            
            {activeTab === 'base' && (
              <>
                <div className="bg-summer-amber border-[4px] border-summer-space shadow-brutal p-6">
                  <h3 className="text-lg font-black uppercase tracking-widest text-summer-space mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 stroke-[3px]" /> Calculation Steps
                  </h3>
                  {baseSteps ? (
                    <div className="p-4 bg-white border-[3px] border-summer-space font-mono text-sm font-bold text-summer-space">
                      {baseSteps}
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-summer-space/80">Enter a valid number to see the step-by-step conversion process.</p>
                  )}
                </div>

                <div className="bg-white border-[4px] border-summer-space shadow-brutal overflow-hidden">
                  <div className="p-4 bg-summer-sea border-b-[4px] border-summer-space">
                    <h3 className="text-sm font-black uppercase tracking-widest text-summer-space">Reference Table: Bin / Dec / Hex</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm">
                      <thead>
                        <tr className="border-b-[3px] border-summer-space bg-summer-sky">
                          <th className="p-3 font-bold">Binary</th>
                          <th className="p-3 font-bold border-l-[3px] border-summer-space">Decimal</th>
                          <th className="p-3 font-bold border-l-[3px] border-summer-space">Hex</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0,1,2,3,4,5,6,7,8,9,10,15,16,32,64,128,255].map((num) => (
                          <tr key={num} className="border-b-[2px] border-summer-space/20 hover:bg-summer-tiger/10 transition-colors">
                            <td className="p-3 font-bold">{num.toString(2)}</td>
                            <td className="p-3 font-bold border-l-[3px] border-summer-space">{num.toString(10)}</td>
                            <td className="p-3 font-bold border-l-[3px] border-summer-space">{num.toString(16).toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
