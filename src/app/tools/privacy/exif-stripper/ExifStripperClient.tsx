'use client';

import React, { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { useExifWorker } from '@/hooks/useExifWorker';

export default function ExifStripperClient() {
  const workerApi = useExifWorker();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('Idle');
  const [exifData, setExifData] = useState<any>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setDownloadUrl(null);
      setProgress(0);
      
      if (!workerApi) return;
      
      try {
        setStatus('Scanning metadata...');
        const arrayBuffer = await selectedFile.arrayBuffer();
        const data = await workerApi.getExifData(arrayBuffer);
        setExifData(Object.keys(data).length > 0 ? data : null);
        setStatus('Ready to strip metadata.');
      } catch (err) {
        setStatus('Error reading metadata.');
      }
    }
  };

  const handleStrip = async () => {
    if (!file || !workerApi) return;
    
    setStatus('Processing...');
    
    // Simulate progress for UI retention adjacent to ad
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(Math.min(p, 90));
    }, 100);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const strippedBuffer = await workerApi.stripExif(arrayBuffer, file.type);
      
      clearInterval(interval);
      setProgress(100);
      
      const newBlob = new Blob([strippedBuffer], { type: file.type });
      const url = URL.createObjectURL(newBlob);
      setDownloadUrl(url);
      setStatus('Metadata successfully stripped!');
      setExifData(null); // Clear displayed exif
    } catch (err) {
      clearInterval(interval);
      setStatus('Error processing image.');
    }
  };

  const formatExifData = (data: any) => {
    if (!data) return null;
    return (
      <ul className="text-xs text-zinc-400 font-mono space-y-1 max-h-[150px] overflow-y-auto">
        {Object.entries(data).map(([key, val]) => (
          // Ignore highly complex objects like MakerNote for simple display
          typeof val !== 'object' && (
            <li key={key}>
              <span className="text-indigo-400">{key}:</span> {String(val)}
            </li>
          )
        ))}
      </ul>
    );
  };

  return (
    <ToolLayout 
      title="Free Online EXIF Data Stripper"
      description="Remove GPS locations, camera models, and hidden metadata from your photos online before uploading."
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
            accept="image/jpeg, image/png, image/webp"
          />
          <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-200 mb-1">
            {file ? file.name : "Select an image"}
          </h3>
          <p className="text-sm text-zinc-500">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports JPG, PNG, WEBP"}
          </p>
        </div>

        {/* Processing State */}
        {status !== 'Idle' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-300 font-medium">{status}</span>
              <span className="text-indigo-400">{progress}%</span>
            </div>
            
            {/* Simulated Progress Bar (Crucial for Ad Viewability Retention) */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {exifData && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Metadata Found!
                </h4>
                {formatExifData(exifData)}
              </div>
            )}
            
            {!exifData && file && status === 'Ready to strip metadata.' && (
               <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">No significant metadata found.</h4>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleStrip}
            disabled={!file || !workerApi || progress > 0 && progress < 100}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            {progress > 0 && progress < 100 ? 'Stripping...' : 'Strip Metadata'}
          </button>
          
          {downloadUrl && (
            <a 
              href={downloadUrl} 
              download={`clean_${file?.name}`}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl text-center transition-colors"
            >
              Download Safe Image
            </a>
          )}
        </div>
      </div>

      {/* SEO content removed; now rendered by server in page.tsx */}
    </ToolLayout>
  );
}
