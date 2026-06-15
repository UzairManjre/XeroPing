'use client';

import { useState, useMemo, useEffect } from 'react';
import { UNIT_DATA, CATEGORY_GROUPS, UnitCategoryGroup, ConverterCategory, UnitDefinition } from './unitDefinitions';
import { ArrowRightLeft, Layers, Component } from 'lucide-react';

export default function UnitConverterClient() {
  const [activeGroup, setActiveGroup] = useState<UnitCategoryGroup>('Common Converters');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(UNIT_DATA[0].id);

  const currentCategories = useMemo(() => UNIT_DATA.filter(c => c.group === activeGroup), [activeGroup]);
  const activeCategory = useMemo(() => UNIT_DATA.find(c => c.id === activeCategoryId) || currentCategories[0], [activeCategoryId, currentCategories]);

  // Unit States
  const [fromUnitId, setFromUnitId] = useState<string>('');
  const [toUnitId, setToUnitId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('1');

  // Reset units when category changes
  useEffect(() => {
    if (activeCategory && activeCategory.units.length >= 2) {
      setFromUnitId(activeCategory.units[0].id);
      setToUnitId(activeCategory.units[1].id);
    } else if (activeCategory && activeCategory.units.length === 1) {
      setFromUnitId(activeCategory.units[0].id);
      setToUnitId(activeCategory.units[0].id);
    }
  }, [activeCategory]);

  const convertValue = (): string => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return '';
    if (fromUnitId === toUnitId) return inputValue;

    const fromUnit = activeCategory.units.find(u => u.id === fromUnitId);
    const toUnit = activeCategory.units.find(u => u.id === toUnitId);
    if (!fromUnit || !toUnit) return '';

    const val = parseFloat(inputValue);

    try {
      // Convert to Base
      let baseVal = 0;
      if (fromUnit.toBase) {
        baseVal = fromUnit.toBase(val);
      } else {
        baseVal = val * fromUnit.ratioToBase;
      }

      // Convert from Base to Target
      let finalVal = 0;
      if (toUnit.fromBase) {
        finalVal = toUnit.fromBase(baseVal);
      } else {
        finalVal = baseVal / toUnit.ratioToBase;
      }

      // Formatting: precision limit
      if (Math.abs(finalVal) < 0.000001 && finalVal !== 0) return finalVal.toExponential(6);
      return parseFloat(finalVal.toFixed(6)).toString();
    } catch (e) {
      return 'Error';
    }
  };

  const swapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  return (
    <div className="space-y-8">
      {/* TOP BAR: Domain Selection */}
      <div className="bg-white border-[4px] border-summer-space shadow-brutal p-4 lg:p-6 overflow-hidden">
        <h3 className="text-lg font-black uppercase tracking-widest text-summer-space mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 stroke-[3px]" /> Select Domain
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {CATEGORY_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => {
                setActiveGroup(group);
                const firstCat = UNIT_DATA.find(c => c.group === group);
                if (firstCat) setActiveCategoryId(firstCat.id);
              }}
              className={`whitespace-nowrap px-6 py-3 font-black uppercase tracking-widest text-sm border-[3px] border-summer-space transition-all ${
                activeGroup === group
                  ? 'bg-summer-space text-white shadow-brutal translate-y-[-2px]'
                  : 'bg-summer-sky text-summer-space hover:bg-summer-amber'
              }`}
            >
              {group.replace(' Converters', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: Properties Selection */}
        <div className="lg:col-span-3 space-y-6">
          {currentCategories.length > 0 && (
            <div className="bg-white border-[4px] border-summer-space shadow-brutal p-6">
              <h3 className="text-xl font-black uppercase tracking-widest text-summer-space border-b-[3px] border-summer-space pb-2 mb-4 flex items-center gap-2">
                <Component className="w-5 h-5 stroke-[3px]" /> Properties
              </h3>
              <div className="flex flex-col gap-2">
                {currentCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full text-left px-4 py-3 font-black uppercase tracking-widest text-sm border-[3px] border-summer-space transition-all ${
                      activeCategoryId === cat.id
                        ? 'bg-summer-tiger text-summer-space shadow-brutal translate-x-1'
                        : 'bg-white text-summer-space hover:bg-summer-sky'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MAIN: Conversion Interface */}
        <div className="lg:col-span-9">
          <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal-lg h-full relative flex flex-col">
            <div className="p-6 border-b-[4px] border-summer-space bg-summer-amber flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-3xl font-black text-summer-space uppercase tracking-tight">
                  {activeCategory?.name || 'Converter'}
                </h2>
                <p className="text-summer-space/80 font-bold uppercase tracking-widest text-xs mt-1">
                  {activeGroup}
                </p>
              </div>
            </div>

            <div className="p-6 lg:p-12 flex-1 flex flex-col justify-center">
              
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
                
                {/* FROM */}
                <div className="space-y-3">
                  <label className="block text-sm font-black uppercase tracking-widest text-summer-space">From</label>
                  <div className="bg-white border-[4px] border-summer-space shadow-brutal p-2 relative">
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full p-2 font-mono text-3xl font-black text-summer-space focus:outline-none"
                      placeholder="0"
                    />
                    <select
                      value={fromUnitId}
                      onChange={(e) => setFromUnitId(e.target.value)}
                      className="w-full mt-2 p-2 border-t-[3px] border-summer-space/20 font-bold uppercase text-xs cursor-pointer focus:outline-none bg-white text-summer-space"
                    >
                      {activeCategory?.units.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SWAP BUTTON */}
                <div className="flex justify-center pb-8">
                  <button 
                    onClick={swapUnits}
                    className="w-14 h-14 bg-summer-tiger hover:bg-summer-amber border-[4px] border-summer-space rounded-full flex items-center justify-center shadow-brutal transition-transform hover:scale-110"
                  >
                    <ArrowRightLeft className="w-6 h-6 text-summer-space stroke-[3px]" />
                  </button>
                </div>

                {/* TO */}
                <div className="space-y-3">
                  <label className="block text-sm font-black uppercase tracking-widest text-summer-space">To</label>
                  <div className="bg-summer-sea border-[4px] border-summer-space shadow-brutal p-2 relative">
                    <div className="w-full p-2 font-mono text-3xl font-black text-summer-space min-h-[56px] overflow-x-auto">
                      {convertValue() || '0'}
                    </div>
                    <select
                      value={toUnitId}
                      onChange={(e) => setToUnitId(e.target.value)}
                      className="w-full mt-2 p-2 border-t-[3px] border-summer-space/20 font-bold uppercase text-xs cursor-pointer focus:outline-none bg-summer-sea text-summer-space"
                    >
                      {activeCategory?.units.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* QUICK COPY / INFO */}
              <div className="mt-8 p-4 border-[3px] border-summer-space bg-white flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-summer-space/70">
                  Formula Engine: Online Precision Mode
                </span>
                <span className="font-black uppercase tracking-widest text-xs text-summer-space bg-summer-amber px-2 py-1 border-[2px] border-summer-space shadow-sm">
                  Active
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
