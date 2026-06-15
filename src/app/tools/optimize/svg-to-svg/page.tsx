'use client';

import React, { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useSvgoWorker } from '@/hooks/useSvgoWorker';

export default function SvgOptimizerPage() {
  const workerApi = useSvgoWorker();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('Idle');
  const [progress, setProgress] = useState(0);
  
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [newSize, setNewSize] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'image/svg+xml' && !selectedFile.name.endsWith('.svg')) {
        setStatus('Please select a valid SVG file.');
        return;
      }
      
      setFile(selectedFile);
      setDownloadUrl(null);
      setOriginalSize(null);
      setNewSize(null);
      setProgress(0);
      setStatus('Ready to optimize.');
    }
  };

  const handleOptimize = async () => {
    if (!file || !workerApi) return;
    
    setStatus('Optimizing Vector Graphics...');
    
    // Simulated progress bar for ad viewability
    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      setProgress(Math.min(p, 90));
    }, 100);

    try {
      const text = await file.text();
      const result = await workerApi.optimizeSvg(text);
      
      clearInterval(interval);
      setProgress(100);
      
      const newBlob = new Blob([result.data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(newBlob);
      
      setDownloadUrl(url);
      setOriginalSize(result.originalSize);
      setNewSize(result.newSize);
      
      setStatus('Optimization complete!');
    } catch (err: any) {
      clearInterval(interval);
      setStatus(err.message || 'Error processing SVG.');
    }
  };

  return (
    <ToolLayout 
      title="SVG Optimizer"
      description="Minify and clean your vector graphics directly in your browser using local SVGO processing."
    >
      <div className="space-y-6">
        {/* Drop Zone */}
        <div 
          className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".svg,image/svg+xml"
          />
          <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-200 mb-1">
            {file ? file.name : "Select an SVG file"}
          </h3>
          <p className="text-sm text-zinc-500">
            {file ? `${(file.size / 1024).toFixed(2)} KB` : "Drag & drop or click to browse"}
          </p>
        </div>

        {/* Processing State */}
        {status !== 'Idle' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-300 font-medium">{status}</span>
              {progress > 0 && <span className="text-indigo-400">{progress}%</span>}
            </div>
            
            {progress > 0 && progress < 100 && (
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {originalSize && newSize && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                  <div className="text-xs text-zinc-500 mb-1">Original</div>
                  <div className="text-lg font-mono text-zinc-300">{(originalSize / 1024).toFixed(2)} KB</div>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                  <div className="text-xs text-zinc-500 mb-1">Optimized</div>
                  <div className="text-lg font-mono text-emerald-400">{(newSize / 1024).toFixed(2)} KB</div>
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center flex flex-col justify-center">
                  <div className="text-xs text-indigo-400 mb-1">Saved</div>
                  <div className="text-xl font-bold text-indigo-400">
                    {Math.round(((originalSize - newSize) / originalSize) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleOptimize}
            disabled={!file || !workerApi || (progress > 0 && progress < 100) || !!downloadUrl}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            {progress > 0 && progress < 100 ? 'Crunching...' : 'Optimize SVG'}
          </button>
          
          {downloadUrl && (
            <a 
              href={downloadUrl} 
              download={`opt_${file?.name}`}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl text-center transition-colors"
            >
              Download Minified SVG
            </a>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
