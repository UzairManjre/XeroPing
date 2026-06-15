'use client';

import { useState, useRef, useEffect } from 'react';
import * as Comlink from 'comlink';
import type { ExifWorkerType, ExifAnalysis, RedactionOptions } from './exifWorker';
import { UploadCloud, ShieldCheck, Download, AlertCircle, Loader2, MapPin, Camera, Clock, Eye, ToggleLeft, ToggleRight, Settings2, Database, ChevronDown, ChevronUp, Image as ImageIcon, Sparkles, Plus, Trash2, Layers, Pencil } from 'lucide-react';
import dynamic from 'next/dynamic';
import AdUnit from '@/components/AdUnit';
import JSZip from 'jszip';

const MapWidget = dynamic(() => import('./MapWidget'), { 
  ssr: false, 
  loading: () => <div className="w-full h-48 bg-summer-sea border-[3px] border-summer-space mt-4 animate-pulse"></div> 
});

let worker: Worker | null = null;
let workerApi: Comlink.Remote<ExifWorkerType> | null = null;

if (typeof window !== 'undefined') {
  worker = new Worker(new URL('./exifWorker.ts', import.meta.url));
  workerApi = Comlink.wrap<ExifWorkerType>(worker);
}

interface BatchItem {
  id: string;
  file: File;
  status: 'idle' | 'analyzing' | 'ready' | 'processing' | 'success' | 'error' | 'clean';
  analysis: ExifAnalysis | null;
  error?: string;
  processedUrl?: string;
  processedBlob?: Blob;
}

export default function ExifRemoverClient() {
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');
  
  // Single Mode State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'inspector' | 'processing' | 'success' | 'error' | 'clean'>('idle');
  const [message, setMessage] = useState('');
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ExifAnalysis | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [options, setOptions] = useState<RedactionOptions>({
    stripGps: true,
    stripSettings: false,
    stripTime: true,
    stripAuthor: true,
  });

  // EXIF Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editLat, setEditLat] = useState<number | null>(null);
  const [editLng, setEditLng] = useState<number | null>(null);

  // Batch Mode State
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchStatus, setBatchStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [batchZipUrl, setBatchZipUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const expandAll = () => {
    if (!analysis?.exhaustiveData) return;
    const allExp: Record<string, boolean> = {};
    Object.keys(analysis.exhaustiveData).forEach(k => allExp[k] = true);
    setExpandedCategories(allExp);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (activeMode === 'single') {
        processFile(e.dataTransfer.files[0]);
      } else {
        addBatchFiles(Array.from(e.dataTransfer.files));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (activeMode === 'single') {
        processFile(e.target.files[0]);
      } else {
        addBatchFiles(Array.from(e.target.files));
      }
    }
  };

  // --- SINGLE MODE LOGIC ---
  const processFile = async (targetFile: File) => {
    if (!targetFile.type.startsWith('image/')) {
      setStatus('error'); setMessage('Invalid file type. Please upload an image.'); return;
    }
    if (!workerApi) {
      setStatus('error'); setMessage('Processing engine not ready. Please wait a moment.'); return;
    }

    setFile(targetFile);
    setStatus('analyzing');
    setMessage('Uncovering hidden metadata...');
    setIsEditing(false);

    try {
      const arrayBuffer = await targetFile.arrayBuffer();
      const analysisData = await workerApi.analyzeImage(arrayBuffer, targetFile.type);
      setAnalysis(analysisData);

      // Initialize edit fields
      setEditMake(analysisData.make || '');
      setEditModel(analysisData.model || '');
      setEditDateTime(analysisData.dateTime || '');
      if (analysisData.gps) {
        setEditLat(analysisData.gps.lat);
        setEditLng(analysisData.gps.lng);
      } else {
        setEditLat(null);
        setEditLng(null);
      }

      if (!analysisData.hasExif) {
        setStatus('clean');
        setMessage('No EXIF data found, file is already clean.');
      } else {
        setStatus('inspector');
      }
    } catch (error: any) {
      setStatus('error'); setMessage(`Analysis failed: ${error.message || String(error)}`);
    }
  };

  const handleSecureImage = async () => {
    if (!file || !workerApi) return;
    setStatus('processing');
    setMessage('Applying redactions and securing image...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await workerApi.processImage(arrayBuffer, file.type, options);

      if (response.status === 'stripped' && response.buffer) {
        const cleanBlob = new Blob([response.buffer], { type: file.type });
        setProcessedUrl(URL.createObjectURL(cleanBlob));
        setStatus('success');
        setMessage(response.message);
      }
    } catch (error: any) {
      setStatus('error'); setMessage(`Processing failed: ${error.message || String(error)}`);
    }
  };

  const handleApplyEdits = async () => {
    if (!file || !workerApi || !analysis) return;
    setStatus('processing');
    setMessage('Writing new metadata updates to image...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const updates: any = {
        make: editMake || undefined,
        model: editModel || undefined,
        dateTime: editDateTime || undefined,
      };
      if (editLat !== null && editLng !== null) {
        updates.lat = editLat;
        updates.lng = editLng;
      }
      
      const updatedBuffer = await workerApi.updateMetadata(arrayBuffer, updates);
      
      // Update local file representation
      const updatedBlob = new Blob([updatedBuffer], { type: file.type });
      const updatedFile = new File([updatedBlob], file.name, { type: file.type });
      
      setFile(updatedFile);
      setIsEditing(false);
      
      // Re-run analysis on the updated file to update UI display
      const analysisData = await workerApi.analyzeImage(updatedBuffer, file.type);
      setAnalysis(analysisData);
      setStatus('inspector');
    } catch (error: any) {
      setStatus('error'); setMessage(`Editing failed: ${error.message || String(error)}`);
    }
  };

  const handleMapPositionChange = (lat: number, lng: number) => {
    setEditLat(lat);
    setEditLng(lng);
  };

  const toggleOption = (key: keyof RedactionOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- BATCH MODE LOGIC ---
  const addBatchFiles = (files: File[]) => {
    const items = files.filter(f => f.type.startsWith('image/')).map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: 'idle' as const,
      analysis: null
    }));
    setBatchItems(prev => [...prev, ...items]);
    setBatchZipUrl(null);
    setBatchStatus('idle');
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const clearBatch = () => {
    // Revoke the zip download URL to free memory
    if (batchZipUrl) URL.revokeObjectURL(batchZipUrl);
    setBatchItems([]);
    setBatchZipUrl(null);
    setBatchStatus('idle');
  };

  const handleBatchStrip = async () => {
    if (batchItems.length === 0 || !workerApi) return;
    setBatchStatus('processing');
    setBatchZipUrl(null);

    const updatedItems = [...batchItems];
    const zip = new JSZip();

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      item.status = 'processing';
      setBatchItems([...updatedItems]);

      try {
        const arrayBuffer = await item.file.arrayBuffer();
        
        // Lossless strip default options
        const result = await workerApi.processImage(arrayBuffer, item.file.type, {
          stripGps: true,
          stripSettings: true,
          stripTime: true,
          stripAuthor: true
        });

        if (result.buffer) {
          const cleanBlob = new Blob([result.buffer], { type: item.file.type });
          item.status = 'success';
          item.processedBlob = cleanBlob;
          zip.file(`safe_${item.file.name}`, cleanBlob);
        } else {
          item.status = 'clean';
        }
      } catch (err: any) {
        item.status = 'error';
        item.error = err.message || 'Processing failed';
      }
      setBatchItems([...updatedItems]);
    }

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      if (batchZipUrl) URL.revokeObjectURL(batchZipUrl); // revoke previous zip URL
      setBatchZipUrl(URL.createObjectURL(zipBlob));
      // Nullify zip and per-item blobs to allow GC to reclaim memory
      (zip as any) = null;
      setBatchItems(prev => prev.map(item => ({ ...item, processedBlob: undefined })));
      setBatchStatus('success');
    } catch (err) {
      setBatchStatus('error');
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center animate-in fade-in">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>Free Online EXIF Remover</h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Edit tags, map coordinates, or securely strip files online. Lossless and fast.</p>
      </header>

      {/* MODE SELECTOR */}
      <div className="flex justify-center mb-8 gap-4">
        <button 
          onClick={() => { setActiveMode('single'); setStatus('idle'); setFile(null); }}
          className={`px-6 py-3 border-[4px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-sm flex items-center gap-2 ${
            activeMode === 'single' ? 'bg-summer-sky text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Single Editor
        </button>
        <button 
          onClick={() => { setActiveMode('batch'); clearBatch(); }}
          className={`px-6 py-3 border-[4px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-sm flex items-center gap-2 ${
            activeMode === 'batch' ? 'bg-summer-sky text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
          }`}
        >
          <Layers className="w-4 h-4" /> Batch Stripper
        </button>
      </div>

      {/* ======================================================== */}
      {/* SINGLE IMAGE EDITOR MODE */}
      {/* ======================================================== */}
      {activeMode === 'single' && (
        <>
          {/* UPLOAD ZONE */}
          {(status === 'idle' || status === 'error' || status === 'analyzing') && (
            <div className="max-w-2xl mx-auto">
              <div 
                className={`relative border-[4px] border-dashed border-summer-space p-12 text-center transition-all shadow-brutal cursor-pointer ${
                  isDragging ? 'bg-summer-amber border-solid' : 'bg-summer-tiger hover:bg-summer-amber hover:-translate-y-1 hover:shadow-brutal-lg'
                }`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-summer-sky border-[4px] border-summer-space flex items-center justify-center mb-2 shadow-brutal">
                    <UploadCloud className="w-10 h-10 text-summer-space stroke-[2.5px]" />
                  </div>
                  <div>
                    <span className="text-summer-space font-black text-2xl uppercase tracking-tighter block">Click to upload image</span>
                    <span className="text-summer-space/80 font-bold text-lg">or drag and drop</span>
                  </div>
                  <p className="inline-block px-3 py-1 bg-summer-space text-summer-sky text-xs font-black uppercase tracking-widest border-[2px] border-summer-space shadow-sm">JPG, PNG, WebP up to 50MB</p>
                </div>
                
                {status === 'analyzing' && (
                  <div className="absolute inset-0 bg-summer-tiger/95 flex flex-col items-center justify-center border-[4px] border-summer-space z-10">
                    <Eye className="w-12 h-12 text-summer-space animate-pulse mb-4 stroke-[2.5px]" />
                    <p className="text-summer-space font-black text-xl uppercase tracking-tight animate-pulse bg-summer-sky px-4 py-2 border-[3px] border-summer-space shadow-brutal">{message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INSPECTOR & EDITOR */}
          {(status === 'inspector' || status === 'processing' || status === 'success') && analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: IMAGE PREVIEW */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal relative">
                  <div className="p-4 border-b-[4px] border-summer-space bg-summer-amber flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 stroke-[3px]" />
                      <h3 className="text-lg font-black uppercase tracking-tight">Image Preview</h3>
                    </div>
                    <button onClick={() => setStatus('idle')} className="text-xs font-black uppercase bg-summer-space text-white px-2 py-1 border-[2px] border-summer-space hover:bg-white hover:text-summer-space transition-colors shadow-sm">Change</button>
                  </div>
                  <div className="p-4 bg-white">
                    {previewUrl && (
                      <div className="border-[3px] border-summer-space overflow-hidden bg-zinc-200 aspect-square relative flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t-[4px] border-summer-space bg-summer-sea flex justify-between items-center text-sm">
                    <div>
                      <span className="block font-black uppercase tracking-widest text-xs">File Size</span>
                      <span className="font-bold">{(file!.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-black uppercase tracking-widest text-xs">Type</span>
                      <span className="font-bold">{file!.type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILS & FORMS */}
              <div className="lg:col-span-7">
                <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal-lg relative">
                  
                  <div className="p-6 border-b-[4px] border-summer-space bg-summer-amber flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6 text-summer-space stroke-[2.5px]" />
                      <h2 className="text-2xl font-black text-summer-space uppercase tracking-tight">Image Metadata</h2>
                    </div>
                    {!isEditing && analysis.isJpeg && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-white hover:bg-summer-sky px-4 py-2 border-[2px] border-summer-space text-xs font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Tags
                      </button>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {isEditing ? (
                      /* EDIT METADATA FORM (JPEG ONLY) */
                      <div className="space-y-4 bg-white p-4 border-[3px] border-summer-space shadow-brutal">
                        <h3 className="font-black text-lg text-summer-space uppercase tracking-tight border-b-[2px] border-summer-space pb-1">Modify EXIF Tags</h3>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1">Camera Manufacturer</label>
                          <input type="text" value={editMake} onChange={e => setEditMake(e.target.value)} className="w-full p-2 border-[2px] border-summer-space text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1">Camera Model</label>
                          <input type="text" value={editModel} onChange={e => setEditModel(e.target.value)} className="w-full p-2 border-[2px] border-summer-space text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1">Creation Date / Time</label>
                          <input type="text" placeholder="YYYY:MM:DD HH:MM:SS" value={editDateTime} onChange={e => setEditDateTime(e.target.value)} className="w-full p-2 border-[2px] border-summer-space text-sm" />
                        </div>

                        {/* GPS Coordinates Edit */}
                        <div className="grid grid-cols-2 gap-4 border-t-[2px] border-summer-space pt-4">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1">GPS Latitude</label>
                            <input 
                              type="number" step="0.00001"
                              value={editLat ?? ''} 
                              onChange={e => setEditLat(parseFloat(e.target.value) || null)} 
                              className="w-full p-2 border-[2px] border-summer-space text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1">GPS Longitude</label>
                            <input 
                              type="number" step="0.00001"
                              value={editLng ?? ''} 
                              onChange={e => setEditLng(parseFloat(e.target.value) || null)} 
                              className="w-full p-2 border-[2px] border-summer-space text-sm" 
                            />
                          </div>
                        </div>

                        {/* Map Picker */}
                        <div className="pt-2">
                          <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1">Click on Map to Set Coordinates</label>
                          <MapWidget 
                            lat={editLat ?? 37.7749} 
                            lng={editLng ?? -122.4194} 
                            onPositionChange={handleMapPositionChange} 
                          />
                        </div>

                        <div className="flex gap-4 border-t-[2px] border-summer-space pt-4 justify-end">
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="bg-white hover:bg-zinc-100 text-summer-space px-4 py-2 border-[2px] border-summer-space font-black uppercase text-xs tracking-widest"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleApplyEdits}
                            className="bg-summer-tiger hover:bg-summer-amber text-summer-space px-6 py-2 border-[2px] border-summer-space font-black uppercase text-xs tracking-widest"
                          >
                            Apply Updates
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* READ-ONLY DISPLAY */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-summer-sea border-[4px] border-summer-space shadow-brutal">
                            <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-xs mb-2"><Camera className="w-4 h-4 stroke-[3px]"/> Device</div>
                            <p className="text-summer-space font-black text-lg leading-tight">{analysis.make} {analysis.model || 'Unknown Device'}</p>
                          </div>
                          <div className="p-4 bg-summer-sea border-[4px] border-summer-space shadow-brutal">
                            <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-xs mb-2"><Clock className="w-4 h-4 stroke-[3px]"/> Timestamp</div>
                            <p className="text-summer-space font-black text-lg leading-tight">{analysis.dateTime || 'Unknown Date'}</p>
                          </div>
                        </div>

                        {analysis.gps ? (
                          <div className="p-4 bg-summer-amber border-[4px] border-summer-space shadow-brutal">
                            <div className="flex items-center gap-2 text-summer-space font-black uppercase tracking-widest text-xs mb-2"><MapPin className="w-4 h-4 stroke-[3px]"/> GPS Coordinates Found</div>
                            <p className="text-summer-space font-bold mb-2">{analysis.gps.lat.toFixed(5)}, {analysis.gps.lng.toFixed(5)}</p>
                            <MapWidget lat={analysis.gps.lat} lng={analysis.gps.lng} />
                          </div>
                        ) : (
                          <div className="p-4 bg-emerald-400 border-[4px] border-summer-space text-summer-space font-black flex items-center gap-2 text-sm shadow-brutal">
                            <ShieldCheck className="w-5 h-5 stroke-[3px]" /> NO GPS DATA DETECTED IN THIS IMAGE.
                          </div>
                        )}

                        {/* EXHAUSTIVE ACCORDION VIEWER */}
                        {analysis.exhaustiveData && status === 'inspector' && (
                          <div className="border-[4px] border-summer-space bg-summer-sea mt-8 shadow-brutal">
                            <div className="p-4 border-b-[4px] border-summer-space flex items-center justify-between bg-summer-tiger flex-wrap gap-4">
                              <div className="flex items-center gap-2">
                                <Database className="w-6 h-6 text-summer-space stroke-[2.5px]" />
                                <h3 className="text-summer-space font-black uppercase tracking-tight text-xl">Raw Tags</h3>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={expandAll} className="px-3 py-1.5 text-xs font-black uppercase tracking-widest text-summer-space bg-summer-sky border-[3px] border-summer-space shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all">Expand All</button>
                                <button onClick={collapseAll} className="px-3 py-1.5 text-xs font-black uppercase tracking-widest text-summer-space bg-summer-sky border-[3px] border-summer-space shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all">Collapse All</button>
                              </div>
                            </div>

                            <div className="divide-y-[3px] divide-summer-space max-h-96 overflow-y-auto">
                              {Object.entries(analysis.exhaustiveData).map(([category, items]) => (
                                <div key={category} className="group">
                                  <button 
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center justify-between p-4 bg-summer-sky hover:bg-summer-amber transition-colors text-left"
                                  >
                                    <span className="text-summer-space font-black uppercase tracking-tight text-lg">{category}</span>
                                    {expandedCategories[category] ? <ChevronUp className="w-5 h-5 text-summer-space stroke-[3px] shrink-0" /> : <ChevronDown className="w-5 h-5 text-summer-space stroke-[3px] shrink-0" />}
                                  </button>
                                  
                                  {expandedCategories[category] && (
                                    <div className="p-4 bg-white">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {items.map((item, idx) => (
                                          <div key={idx} className="flex flex-col">
                                            <span className="text-xs font-bold text-summer-space/70 uppercase tracking-widest mb-1">{item.label}</span>
                                            <span className="text-sm text-summer-space font-black break-words">{item.value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SELECTIVE REDACTION TOGGLES */}
                        {analysis.isJpeg && status === 'inspector' && (
                          <div className="border-t-[4px] border-summer-space pt-6">
                            <h3 className="text-summer-space font-black uppercase tracking-tight text-xl mb-4 flex items-center gap-2"><Settings2 className="w-6 h-6 stroke-[2.5px]" /> Selective Redaction</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-4 border-[3px] border-summer-space bg-white shadow-brutal">
                                <span className="text-summer-space font-bold">Strip Location (GPS)</span>
                                <button onClick={() => toggleOption('stripGps')} className="text-summer-tiger hover:scale-110 transition-transform">
                                  {options.stripGps ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-summer-space/30" />}
                                </button>
                              </div>
                              <div className="flex items-center justify-between p-4 border-[3px] border-summer-space bg-white shadow-brutal">
                                <span className="text-summer-space font-bold">Strip Camera Settings</span>
                                <button onClick={() => toggleOption('stripSettings')} className="text-summer-tiger hover:scale-110 transition-transform">
                                  {options.stripSettings ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-summer-space/30" />}
                                </button>
                              </div>
                              <div className="flex items-center justify-between p-4 border-[3px] border-summer-space bg-white shadow-brutal">
                                <span className="text-summer-space font-bold">Strip Timestamps</span>
                                <button onClick={() => toggleOption('stripTime')} className="text-summer-tiger hover:scale-110 transition-transform">
                                  {options.stripTime ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-summer-space/30" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {!analysis.isJpeg && status === 'inspector' && (
                          <div className="p-4 bg-summer-tiger border-[4px] border-summer-space text-summer-space font-black text-sm shadow-brutal uppercase">
                            Lossless chunk removal will run automatically for PNG/WebP files.
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* ACTION BUTTONS (READ-ONLY) */}
                  {status === 'inspector' && !isEditing && (
                    <div className="p-6 bg-summer-space border-t-[4px] border-summer-space text-right">
                      <button onClick={handleSecureImage} className="bg-summer-tiger hover:bg-summer-amber text-summer-space px-8 py-4 border-[3px] border-summer-space font-black uppercase tracking-widest text-lg transition-all shadow-[4px_4px_0px_#8ecae6] hover:translate-y-1 hover:shadow-none w-full sm:w-auto">
                        Eradicate Metadata
                      </button>
                    </div>
                  )}

                  {/* PROCESSING OVERLAY */}
                  {status === 'processing' && (
                    <div className="absolute inset-0 bg-summer-space/95 flex flex-col items-center justify-center z-20 border-[4px] border-summer-space animate-fade-in">
                      <Loader2 className="w-16 h-16 text-summer-tiger animate-spin mb-6 stroke-[3px]" />
                      <p className="text-summer-sky font-black text-2xl uppercase tracking-widest animate-pulse">{message}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* STATUS OUTPUTS & FOOTER AD */}
          {status === 'success' && processedUrl && (
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="mt-8 p-6 bg-emerald-400 border-[4px] border-summer-space flex flex-col sm:flex-row items-center gap-6 justify-between shadow-brutal-lg animate-in slide-in-from-bottom-4 fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-summer-space flex items-center justify-center shadow-brutal shrink-0">
                    <ShieldCheck className="w-8 h-8 text-summer-space stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="text-summer-space font-black text-2xl uppercase tracking-tighter">Image Secured</h4>
                    <p className="text-sm font-bold text-summer-space/80">{message}</p>
                  </div>
                </div>
                <a href={processedUrl} download={`secure_${file?.name}`} className="shrink-0 bg-white hover:bg-summer-sky text-summer-space px-6 py-3 border-[3px] border-summer-space font-black uppercase tracking-widest transition-all shadow-brutal hover:translate-y-1 hover:shadow-none flex items-center gap-3">
                  <Download className="w-5 h-5 stroke-[3px]" /> Download Clean
                </a>
              </div>
            </div>
          )}
          
          {status === 'clean' && (
            <div className="max-w-2xl mx-auto p-8 bg-white border-[4px] border-summer-space flex flex-col items-center justify-center text-center shadow-brutal-lg">
              <div className="w-16 h-16 bg-summer-sky border-[3px] border-summer-space flex items-center justify-center mb-4 shadow-brutal">
                <ShieldCheck className="w-8 h-8 text-summer-space stroke-[3px]" />
              </div>
              <h3 className="text-2xl text-summer-space font-black uppercase tracking-tight mb-2">Already Clean</h3>
              <p className="text-summer-space/80 font-bold">{message}</p>
              <button onClick={() => setStatus('idle')} className="mt-6 text-summer-space font-black uppercase tracking-widest border-b-[3px] border-summer-space hover:bg-summer-amber transition-colors">Process another file</button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-rose-500 border-[4px] border-summer-space flex items-center gap-4 shadow-brutal-lg">
              <div className="w-10 h-10 bg-white border-[3px] border-summer-space flex items-center justify-center shadow-brutal shrink-0">
                <AlertCircle className="w-6 h-6 text-summer-space stroke-[3px]" />
              </div>
              <p className="text-white font-black uppercase tracking-tight">{message}</p>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* BATCH IMAGE STRIPPER MODE */}
      {/* ======================================================== */}
      {activeMode === 'batch' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
          
          {/* BATCH UPLOAD CONTAINER */}
          <div 
            className={`relative border-[4px] border-dashed border-summer-space p-10 text-center transition-all shadow-brutal cursor-pointer ${
              isDragging ? 'bg-summer-amber border-solid' : 'bg-summer-tiger hover:bg-summer-amber'
            }`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => batchInputRef.current?.click()}
          >
            <input type="file" ref={batchInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" multiple onChange={handleFileChange} />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 bg-summer-sky border-[3px] border-summer-space flex items-center justify-center shadow-brutal">
                <Plus className="w-8 h-8 text-summer-space stroke-[3px]" />
              </div>
              <span className="text-summer-space font-black text-xl uppercase tracking-tighter block">Upload Multiple Images</span>
              <p className="text-xs font-bold text-summer-space/70 uppercase tracking-widest">Strip GPS, Exif, and author logs from multiple files in parallel.</p>
            </div>
          </div>

          {/* BATCH FILE LIST */}
          {batchItems.length > 0 && (
            <div className="bg-white border-[4px] border-summer-space p-6 shadow-brutal">
              <div className="flex justify-between items-center border-b-[3px] border-summer-space pb-3 mb-4">
                <span className="font-black uppercase tracking-widest text-sm text-summer-space">Upload Pool ({batchItems.length} Files)</span>
                <button 
                  onClick={clearBatch}
                  className="text-xs font-black uppercase text-rose-500 hover:text-rose-700 underline"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {batchItems.map((item) => (
                  <div key={item.id} className="bg-summer-sky/20 border-[3px] border-summer-space p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <ImageIcon className="w-5 h-5 text-summer-space shrink-0" />
                      <div className="truncate">
                        <p className="font-black text-sm text-summer-space truncate">{item.file.name}</p>
                        <p className="text-[10px] font-bold text-summer-space/60 uppercase">{(item.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      {item.status === 'idle' && (
                        <span className="px-2 py-0.5 bg-zinc-200 border border-summer-space text-[10px] font-black uppercase text-zinc-600">Pending</span>
                      )}
                      {item.status === 'processing' && (
                        <span className="px-2 py-0.5 bg-summer-amber border border-summer-space text-[10px] font-black uppercase text-summer-space flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Stripping
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className="px-2 py-0.5 bg-emerald-400 border border-summer-space text-[10px] font-black uppercase text-summer-space">Secured</span>
                      )}
                      {item.status === 'clean' && (
                        <span className="px-2 py-0.5 bg-sky-200 border border-summer-space text-[10px] font-black uppercase text-summer-space">No metadata</span>
                      )}
                      {item.status === 'error' && (
                        <span className="px-2 py-0.5 bg-rose-400 border border-summer-space text-[10px] font-black uppercase text-white" title={item.error}>Failed</span>
                      )}
                      
                      <button 
                        onClick={() => removeBatchItem(item.id)}
                        className="text-xs font-black uppercase text-rose-500 hover:text-rose-700 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION EXECUTION PANEL */}
              <div className="mt-6 border-t-[3px] border-summer-space pt-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <h4 className="font-black text-sm uppercase text-summer-space">Bulk Security Actions</h4>
                  <p className="text-xs text-summer-space/75 font-bold">Processes all files online. Non-JPEG files will use lossless chunk-skipping.</p>
                </div>
                
                {batchStatus !== 'success' ? (
                  <button 
                    onClick={handleBatchStrip}
                    disabled={batchStatus === 'processing'}
                    className="bg-summer-tiger hover:bg-summer-amber text-summer-space px-8 py-3.5 border-[3px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_#023047] disabled:opacity-50 flex items-center gap-2"
                  >
                    {batchStatus === 'processing' ? <><Loader2 className="w-4 h-4 animate-spin" /> Stripping batch...</> : <><ShieldCheck className="w-4 h-4 stroke-[3.5px]" /> Secure All Files</>}
                  </button>
                ) : (
                  batchZipUrl && (
                    <a 
                      href={batchZipUrl} 
                      download="secured_images.zip"
                      className="bg-emerald-400 hover:bg-emerald-500 text-summer-space px-8 py-3.5 border-[3px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_#023047] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 stroke-[3px]" /> Download Secured ZIP
                    </a>
                  )
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* FOOTER AD */}
      <div className="flex justify-center w-full mt-12">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      {/* SEO content removed; now rendered by server in page.tsx */}

    </div>
  );
}
