'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import * as Comlink from 'comlink';
import type { MagickWorkerType, ConvertOptions } from './magickWorker';
import { UploadCloud, Image as ImageIcon, Settings2, Download, AlertCircle, Loader2, FileArchive, RefreshCw, Layers, Sliders, Check, Trash2, ArrowLeftRight, Minimize, Crop } from 'lucide-react';
import AdUnit from '@/components/AdUnit';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

type Format = 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif' | 'image/gif' | 'image/bmp' | 'image/tiff' | 'image/x-icon' | 'application/pdf';

interface BatchImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'converting' | 'success' | 'error';
  processedBlob: Blob | null;
  processedUrl: string | null;
  error?: string;
  newSize?: number;
}

let workerInstance: Worker | null = null;
let workerApi: Comlink.Remote<MagickWorkerType> | null = null;

if (typeof window !== 'undefined') {
  workerInstance = new Worker(new URL('./magickWorker.ts', import.meta.url));
  workerApi = Comlink.wrap<MagickWorkerType>(workerInstance);
}

export default function ImageConverter() {
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Mode State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // Settings
  const [targetFormat, setTargetFormat] = useState<Format>('image/webp');
  const [quality, setQuality] = useState<number>(0.8);
  const [maxWidth, setMaxWidth] = useState<number>(1920);

  // Pre-transform options
  const [grayscale, setGrayscale] = useState(false);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [cropRatio, setCropRatio] = useState<'none' | '1:1' | '16:9' | '4:3'>('none');

  // Comparison slider position
  const [sliderPos, setSliderPos] = useState(50);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  // Result
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  // Batch Mode State
  const [batchItems, setBatchItems] = useState<BatchImageItem[]>([]);
  const [batchStatus, setBatchStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  const [batchZipUrl, setBatchZipUrl] = useState<string | null>(null);
  const [mergeToPdf, setMergeToPdf] = useState(true);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // Handle single file preview URL creation
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (activeMode === 'single') {
        processSelection(e.dataTransfer.files[0]);
      } else {
        addBatchFiles(Array.from(e.dataTransfer.files));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (activeMode === 'single') {
        processSelection(e.target.files[0]);
      } else {
        addBatchFiles(Array.from(e.target.files));
      }
    }
  };

  const processSelection = (targetFile: File) => {
    setFile(targetFile);
    setStatus('idle');
    setProcessedFile(null);
    setProcessedUrl(null);
    setGrayscale(false);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropRatio('none');
  };

  // Preprocess image on canvas before conversion
  const preprocessImageOnCanvas = async (sourceFile: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(sourceFile);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not construct 2D context");

          let srcWidth = img.width;
          let srcHeight = img.height;
          let srcX = 0;
          let srcY = 0;

          // 1. Crop Transformation
          if (cropRatio !== 'none') {
            let targetRatio = 1.0;
            if (cropRatio === '16:9') targetRatio = 16 / 9;
            else if (cropRatio === '4:3') targetRatio = 4 / 3;

            if (srcWidth / srcHeight > targetRatio) {
              // Source is wider than target crop
              const cropWidth = srcHeight * targetRatio;
              srcX = (srcWidth - cropWidth) / 2;
              srcWidth = cropWidth;
            } else {
              // Source is taller than target crop
              const cropHeight = srcWidth / targetRatio;
              srcY = (srcHeight - cropHeight) / 2;
              srcHeight = cropHeight;
            }
          }

          // 2. Rotation & Dimensions Calculation
          const isRotated90or270 = rotation === 90 || rotation === 270;
          canvas.width = isRotated90or270 ? srcHeight : srcWidth;
          canvas.height = isRotated90or270 ? srcWidth : srcHeight;

          // Apply transformations
          ctx.translate(canvas.width / 2, canvas.height / 2);

          if (rotation !== 0) {
            ctx.rotate((rotation * Math.PI) / 180);
          }

          const scaleX = flipH ? -1 : 1;
          const scaleY = flipV ? -1 : 1;
          ctx.scale(scaleX, scaleY);

          // Apply Grayscale filter
          if (grayscale) {
            ctx.filter = 'grayscale(100%)';
          }

          // Draw the crop region
          ctx.drawImage(
            img,
            srcX,
            srcY,
            srcWidth,
            srcHeight,
            -srcWidth / 2,
            -srcHeight / 2,
            srcWidth,
            srcHeight
          );

          // Convert to blob and return arrayBuffer
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob.arrayBuffer());
            } else {
              reject(new Error("Canvas conversion to Blob failed"));
            }
          }, 'image/png');
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Single file conversion trigger
  const handleConvert = async () => {
    if (!file) return;
    if (!workerApi) {
      setStatus('error'); setMessage('WASM Engine not ready yet.'); return;
    }

    setStatus('converting');
    setMessage(`Applying visual transforms and converting...`);

    try {
      // Step 1: Preprocess on Canvas
      const preprocessedBuffer = await preprocessImageOnCanvas(file);

      // Step 2: Convert using ImageMagick WASM worker
      const options: ConvertOptions = {
        maxWidth: targetFormat === 'image/x-icon' ? Math.min(maxWidth, 256) : maxWidth,
        targetFormat: targetFormat,
        quality: quality
      };

      const result = await workerApi.convertImage(preprocessedBuffer, options);
      
      const compressedBlob = new Blob([result.buffer], { type: result.mime });
      const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat.split('/')[1];
      const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '_optimized.' + ext;
      const newFile = new File([compressedBlob], newName, { type: result.mime });

      setProcessedFile(newFile);
      setProcessedUrl(URL.createObjectURL(compressedBlob));
      setStatus('success');
      setMessage('Conversion Complete');
    } catch (error: any) {
      setStatus('error');
      setMessage(`${error.message || String(error)}`);
    }
  };

  // Custom visual comparison slider handler
  const handleSliderMove = (e: React.MouseEvent) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleSliderTouch = (e: React.TouchEvent) => {
    if (!compareContainerRef.current || e.touches.length === 0) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  // --- BATCH CONVERSION LOGIC ---
  const addBatchFiles = (filesList: File[]) => {
    const newItems = filesList.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'idle' as const,
      processedBlob: null,
      processedUrl: null
    }));
    setBatchItems(prev => [...prev, ...newItems]);
    setBatchZipUrl(null);
    setBatchStatus('idle');
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const clearBatch = () => {
    batchItems.forEach(item => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
    });
    setBatchItems([]);
    setBatchZipUrl(null);
    setBatchStatus('idle');
  };

  const handleBatchConvert = async () => {
    if (batchItems.length === 0 || !workerApi) return;
    setBatchStatus('converting');
    setBatchZipUrl(null);

    const updatedItems = [...batchItems];
    let pdfDoc: PDFDocument | null = null;
    let zip: JSZip | null = null;

    if (targetFormat === 'application/pdf' && mergeToPdf) {
      pdfDoc = await PDFDocument.create();
    } else {
      zip = new JSZip();
    }

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      item.status = 'converting';
      setBatchItems([...updatedItems]);

      try {
        const buffer = await item.file.arrayBuffer();
        
        if (pdfDoc) {
          // Merge to PDF: convert to JPEG first for pdf-lib compatibility
          const options: ConvertOptions = { maxWidth, targetFormat: 'image/jpeg', quality };
          const result = await workerApi.convertImage(buffer, options);
          
          const image = await pdfDoc.embedJpg(result.buffer);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

          item.status = 'success';
          item.processedUrl = '#'; // merged
        } else {
          // Normal logic
          const options: ConvertOptions = { maxWidth, targetFormat, quality };
          const result = await workerApi.convertImage(buffer, options);
          const compressedBlob = new Blob([result.buffer], { type: result.mime });
          
          item.status = 'success';
          item.processedBlob = compressedBlob;
          item.processedUrl = URL.createObjectURL(compressedBlob);
          item.newSize = compressedBlob.size;

          const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat.split('/')[1];
          const newName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) + '_converted.' + ext;
          zip!.file(newName, compressedBlob);
        }
      } catch (err: any) {
        item.status = 'error';
        item.error = err.message || 'Conversion error';
      }
      setBatchItems([...updatedItems]);
    }

    try {
      if (pdfDoc) {
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        const pdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setBatchZipUrl(URL.createObjectURL(pdfBlob));
      } else if (zip) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setBatchZipUrl(URL.createObjectURL(zipBlob));
      }
      setBatchStatus('success');
    } catch (err) {
      setBatchStatus('error');
    }
  };

  const formatSize = (bytes: number) => (bytes / 1024).toFixed(2) + ' KB';

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center animate-in fade-in">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>Image Converter</h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Convert formats, apply canvas filters, and compare visual compression side-by-side.</p>
      </header>

      {/* MODE SELECTOR */}
      <div className="flex justify-center mb-8 gap-4">
        <button 
          onClick={() => { setActiveMode('single'); setStatus('idle'); setFile(null); }}
          className={`px-6 py-3 border-[4px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-sm flex items-center gap-2 ${
            activeMode === 'single' ? 'bg-summer-sky text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
          }`}
        >
          <Sliders className="w-4 h-4" /> Single Editor
        </button>
        <button 
          onClick={() => { setActiveMode('batch'); clearBatch(); }}
          className={`px-6 py-3 border-[4px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-sm flex items-center gap-2 ${
            activeMode === 'batch' ? 'bg-summer-sky text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
          }`}
        >
          <Layers className="w-4 h-4" /> Batch Converter
        </button>
      </div>

      {/* ======================================================== */}
      {/* SINGLE IMAGE MODE */}
      {/* ======================================================== */}
      {activeMode === 'single' && (
        <>
          {/* UPLOAD ZONE (When No File Selected) */}
          {!file && (
            <div className="max-w-3xl mx-auto">
              <div 
                className={`relative border-[4px] border-dashed border-summer-space p-12 text-center transition-all shadow-brutal cursor-pointer ${
                  isDragging ? 'bg-summer-sky border-solid' : 'bg-summer-amber hover:bg-summer-tiger hover:-translate-y-1 hover:shadow-brutal-lg'
                }`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".png, .jpg, .jpeg, .webp, .gif, .bmp, .tiff, .tif, .cr2, .nef, .arw, .dng, .psd, .ai, .eps, .pdf, .avif" onChange={handleFileChange} />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-summer-sea border-[4px] border-summer-space flex items-center justify-center mb-2 shadow-brutal">
                    <UploadCloud className="w-10 h-10 text-summer-space stroke-[2.5px]" />
                  </div>
                  <div>
                    <span className="text-summer-space font-black text-2xl uppercase tracking-tighter block">Click to upload image</span>
                    <span className="text-summer-space/80 font-bold text-lg">or drag and drop</span>
                  </div>
                  <p className="inline-block px-3 py-1 bg-summer-space text-summer-sky text-xs font-black uppercase tracking-widest border-[2px] border-summer-space shadow-sm">JPG, PNG, WebP, AVIF, RAW, PSD, TIFF, EPS, AI</p>
                  <div className="text-[10px] uppercase font-black tracking-widest text-summer-space/60 mt-2">Powered by ImageMagick WebAssembly Engine</div>
                </div>
              </div>
            </div>
          )}

          {/* TWO-COLUMN LAYOUT */}
          {file && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: COMPARISON OR PREVIEW */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal relative">
                  <div className="p-4 border-b-[4px] border-summer-space bg-summer-tiger flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 stroke-[3px]" />
                      <h3 className="text-lg font-black uppercase tracking-tight">
                        {status === 'success' && processedUrl ? 'Visual Comparison' : 'Image Preview'}
                      </h3>
                    </div>
                    <button onClick={() => setFile(null)} className="text-xs font-black uppercase bg-summer-space text-white px-2 py-1 border-[2px] border-summer-space hover:bg-white hover:text-summer-space transition-colors shadow-sm">Change</button>
                  </div>
                  
                  <div className="p-4 bg-white">
                    {/* Render split slider comparison if conversion is successful */}
                    {status === 'success' && processedUrl && previewUrl ? (
                      <div 
                        ref={compareContainerRef}
                        onMouseMove={handleSliderMove}
                        onTouchMove={handleSliderTouch}
                        className="relative w-full aspect-square border-[3px] border-summer-space overflow-hidden select-none cursor-ew-resize bg-zinc-100"
                      >
                        {/* Compressed Preview (Drawn underneath or cropped) */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={processedUrl} 
                          alt="Compressed" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                        />
                        
                        {/* Original Preview Layer (Cropped dynamically by sliderPos) */}
                        <div 
                          className="absolute inset-y-0 left-0 overflow-hidden border-r-[2px] border-summer-tiger z-10" 
                          style={{ width: `${sliderPos}%` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={previewUrl} 
                            alt="Original" 
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none" 
                            style={{ 
                              width: compareContainerRef.current?.getBoundingClientRect().width || '100%',
                              height: compareContainerRef.current?.getBoundingClientRect().height || '100%'
                            }} 
                          />
                        </div>

                        {/* Draggable indicator badge */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-summer-tiger z-20 pointer-events-none" 
                          style={{ left: `${sliderPos}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-summer-amber border-[3px] border-summer-space flex items-center justify-center font-black text-xs text-summer-space shadow-sm">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 z-30 bg-summer-space text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">Original (Left)</div>
                        <div className="absolute top-2 right-2 z-30 bg-summer-amber text-summer-space px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">Converted (Right)</div>
                      </div>
                    ) : (
                      /* Standard single image preview */
                      previewUrl && (
                        <div className="border-[3px] border-summer-space overflow-hidden bg-zinc-200 aspect-square relative flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      )
                    )}
                  </div>
                  
                  <div className="p-4 border-t-[4px] border-summer-space bg-summer-sea flex justify-between items-center text-sm">
                    <div>
                      <span className="block font-black uppercase tracking-widest text-xs">Original Size</span>
                      <span className="font-bold">{formatSize(file.size)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-black uppercase tracking-widest text-xs">Format</span>
                      <span className="font-bold">{file.type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: CONTROL PANEL */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal-lg relative">
                  
                  <div className="p-6 border-b-[4px] border-summer-space bg-summer-sea flex items-center gap-3">
                    <div className="w-10 h-10 bg-summer-space flex items-center justify-center border-[2px] border-summer-space">
                      <Settings2 className="w-6 h-6 text-summer-sea stroke-[2.5px]" />
                    </div>
                    <h2 className="text-2xl font-black text-summer-space uppercase tracking-tight">Conversion Settings</h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Pre-Transformations */}
                    <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal space-y-4">
                      <h3 className="text-summer-space font-black uppercase tracking-widest text-xs border-b-[2px] border-summer-space pb-1 mb-2">Transform Image</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {/* Grayscale Toggle */}
                        <button 
                          onClick={() => setGrayscale(!grayscale)}
                          className={`py-2 px-1 border-[2px] border-summer-space font-black uppercase text-xs transition-colors ${
                            grayscale ? 'bg-summer-space text-white' : 'bg-white hover:bg-summer-sky'
                          }`}
                        >
                          Grayscale
                        </button>
                        {/* Rotate 90 */}
                        <button 
                          onClick={() => setRotation(r => (r + 90) % 360)}
                          className="py-2 px-1 border-[2px] border-summer-space bg-white hover:bg-summer-sky font-black uppercase text-xs"
                        >
                          Rotate {rotation}°
                        </button>
                        {/* Flip H */}
                        <button 
                          onClick={() => setFlipH(!flipH)}
                          className={`py-2 px-1 border-[2px] border-summer-space font-black uppercase text-xs transition-colors ${
                            flipH ? 'bg-summer-space text-white' : 'bg-white hover:bg-summer-sky'
                          }`}
                        >
                          Flip Horiz
                        </button>
                        {/* Flip V */}
                        <button 
                          onClick={() => setFlipV(!flipV)}
                          className={`py-2 px-1 border-[2px] border-summer-space font-black uppercase text-xs transition-colors ${
                            flipV ? 'bg-summer-space text-white' : 'bg-white hover:bg-summer-sky'
                          }`}
                        >
                          Flip Vert
                        </button>
                      </div>

                      {/* Crop Ratio Selector */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-summer-space/75 mb-1.5 flex items-center gap-1.5"><Crop className="w-3.5 h-3.5" /> Crop Aspect Ratio</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['none', '1:1', '16:9', '4:3'] as const).map(ratio => (
                            <button 
                              key={ratio}
                              onClick={() => setCropRatio(ratio)}
                              className={`py-2 border-[2px] border-summer-space font-black uppercase text-xs transition-colors ${
                                cropRatio === ratio ? 'bg-summer-space text-white' : 'bg-white hover:bg-summer-sky'
                              }`}
                            >
                              {ratio === 'none' ? 'Free (No Crop)' : ratio}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal">
                      <label className="block text-summer-space font-black uppercase tracking-widest text-sm mb-3">Target Format</label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {(['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/gif', 'image/bmp', 'image/tiff', 'image/x-icon', 'application/pdf'] as Format[]).map(fmt => (
                          <button 
                            key={fmt}
                            onClick={() => setTargetFormat(fmt)}
                            className={`py-2 px-1 border-[3px] border-summer-space font-black uppercase tracking-widest text-xs transition-all shadow-sm ${
                              targetFormat === fmt ? 'bg-summer-space text-white scale-105 shadow-brutal' : 'bg-white text-summer-space hover:bg-summer-sky'
                            }`}
                          >
                            {fmt === 'image/x-icon' ? 'ICO' : fmt === 'application/pdf' ? 'PDF' : fmt.split('/')[1]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality Slider */}
                    <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal">
                      <label className="flex justify-between items-center text-summer-space font-black uppercase tracking-widest text-sm mb-3">
                        <span>Quality</span>
                        <span className="text-summer-tiger bg-summer-space px-2 py-0.5 border-[2px] border-summer-space">{Math.round(quality * 100)}%</span>
                      </label>
                      <input 
                        type="range" min="0.1" max="1" step="0.05" 
                        value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-summer-tiger h-3 bg-summer-sky border-[2px] border-summer-space appearance-none cursor-pointer rounded-none"
                      />
                      <p className="text-xs font-bold text-summer-space/70 mt-2 uppercase tracking-widest">Lower quality = Smaller file size</p>
                    </div>

                    {/* Dimensions */}
                    <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal">
                      <label className="block text-summer-space font-black uppercase tracking-widest text-sm mb-3">Max Width / Height</label>
                      <select 
                        value={maxWidth} onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                        className="w-full p-3 bg-summer-sky border-[3px] border-summer-space font-black text-summer-space shadow-sm uppercase tracking-widest focus:outline-none"
                      >
                        <option value={800}>800px (Fast Web)</option>
                        <option value={1200}>1200px (Standard HD)</option>
                        <option value={1920}>1920px (Full HD)</option>
                        <option value={3840}>3840px (4K)</option>
                      </select>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="p-6 bg-summer-space border-t-[4px] border-summer-space text-right">
                    <button 
                      onClick={handleConvert} 
                      disabled={status === 'converting'}
                      className="bg-summer-amber disabled:bg-summer-amber/50 hover:bg-summer-tiger text-summer-space px-8 py-4 border-[3px] border-summer-space font-black uppercase tracking-widest text-lg transition-all shadow-[4px_4px_0px_#8ecae6] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {status === 'converting' ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><RefreshCw className="w-5 h-5 stroke-[3px]" /> Convert Image</>}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ERROR STATUS */}
          {status === 'error' && (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-rose-500 border-[4px] border-summer-space flex items-center gap-4 shadow-brutal-lg">
              <div className="w-10 h-10 bg-white border-[3px] border-summer-space flex items-center justify-center shadow-brutal shrink-0">
                <AlertCircle className="w-6 h-6 text-summer-space stroke-[3px]" />
              </div>
              <p className="text-white font-black uppercase tracking-tight">{message}</p>
            </div>
          )}

          {/* SUCCESS STATUS */}
          {status === 'success' && processedFile && processedUrl && (
            <div className="mt-12 space-y-10 max-w-4xl mx-auto">
              <div className="p-8 bg-emerald-400 border-[4px] border-summer-space flex flex-col md:flex-row items-center gap-6 justify-between shadow-brutal-lg animate-in slide-in-from-bottom-4 fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white border-[3px] border-summer-space flex items-center justify-center shadow-brutal shrink-0">
                    <FileArchive className="w-8 h-8 text-summer-space stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="text-summer-space font-black text-3xl uppercase tracking-tighter">Conversion Ready</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-bold text-summer-space/90">New Format: <span className="uppercase">{targetFormat.split('/')[1]}</span></p>
                      <p className="text-sm font-bold text-summer-space/90 flex items-center gap-2">
                        New Size: <span className="bg-summer-space text-emerald-400 px-2 py-0.5 rounded-none">{formatSize(processedFile.size)}</span>
                        <span className="line-through opacity-50">{formatSize(file!.size)}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <a href={processedUrl} download={processedFile.name} className="shrink-0 bg-white hover:bg-summer-sky text-summer-space px-8 py-4 border-[4px] border-summer-space font-black uppercase tracking-widest text-lg transition-all shadow-[6px_6px_0px_#023047] hover:translate-y-1 hover:shadow-none flex items-center gap-3">
                  <Download className="w-6 h-6 stroke-[3px]" /> Download Now
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* BATCH CONVERSION MODE */}
      {/* ======================================================== */}
      {activeMode === 'batch' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
          {/* BATCH UPLOAD ZONE */}
          <div 
            className={`relative border-[4px] border-dashed border-summer-space p-10 text-center transition-all shadow-brutal cursor-pointer ${
              isDragging ? 'bg-summer-sky border-solid' : 'bg-summer-amber hover:bg-summer-tiger'
            }`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => batchInputRef.current?.click()}
          >
            <input type="file" ref={batchInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 bg-summer-sea border-[3px] border-summer-space flex items-center justify-center shadow-brutal">
                <Layers className="w-8 h-8 text-summer-space" />
              </div>
              <span className="text-summer-space font-black text-xl uppercase tracking-tighter block">Select Multiple Images</span>
              <p className="text-xs font-bold text-summer-space/70 uppercase tracking-widest">Convert a batch of files simultaneously online.</p>
            </div>
          </div>

          {/* BATCH ITEMS GRID */}
          {batchItems.length > 0 && (
            <div className="bg-white border-[4px] border-summer-space p-6 shadow-brutal space-y-6">
              
              <div className="flex justify-between items-center border-b-[3px] border-summer-space pb-3">
                <span className="font-black uppercase tracking-widest text-sm text-summer-space">Batch Items ({batchItems.length})</span>
                <button onClick={clearBatch} className="text-xs font-black uppercase text-rose-500 hover:text-rose-700 underline">Clear All</button>
              </div>

              {/* Format selection for the entire batch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-summer-sky/20 p-4 border-[2px] border-summer-space">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-summer-space/70 mb-1.5">Target Format</label>
                  <select 
                    value={targetFormat} 
                    onChange={e => setTargetFormat(e.target.value as Format)}
                    className="w-full p-2 border-[2px] border-summer-space bg-white text-xs font-black uppercase focus:outline-none"
                  >
                    <option value="image/webp">WEBP</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/avif">AVIF</option>
                    <option value="image/gif">GIF</option>
                    <option value="image/bmp">BMP</option>
                    <option value="image/tiff">TIFF</option>
                    <option value="application/pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-summer-space/70 mb-1.5">Compression Quality</label>
                  <select 
                    value={quality} 
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full p-2 border-[2px] border-summer-space bg-white text-xs font-black uppercase focus:outline-none"
                  >
                    <option value="0.95">Best Quality (95%)</option>
                    <option value="0.8">Standard (80%)</option>
                    <option value="0.6">Medium (60%)</option>
                    <option value="0.4">Aggressive (40%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-summer-space/70 mb-1.5">Max Dimension Limit</label>
                  <select 
                    value={maxWidth} 
                    onChange={e => setMaxWidth(parseInt(e.target.value))}
                    className="w-full p-2 border-[2px] border-summer-space bg-white text-xs font-black uppercase focus:outline-none"
                  >
                    <option value="800">800px (Fast Web)</option>
                    <option value="1200">1200px (HD)</option>
                    <option value="1920">1920px (Full HD)</option>
                    <option value="3840">3840px (4K)</option>
                  </select>
                </div>
              </div>
              {targetFormat === 'application/pdf' && (
                <div className="flex items-center gap-2 px-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="mergePdf" 
                    checked={mergeToPdf} 
                    onChange={e => setMergeToPdf(e.target.checked)} 
                    className="w-4 h-4 accent-summer-space" 
                  />
                  <label htmlFor="mergePdf" className="text-xs font-black uppercase tracking-widest text-summer-space">Merge into single PDF document</label>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {batchItems.map((item) => (
                  <div key={item.id} className="border-[2px] border-summer-space p-3 bg-zinc-50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt="item" className="w-10 h-10 object-cover border border-summer-space" />
                      <div className="truncate">
                        <p className="font-black text-sm text-summer-space truncate">{item.file.name}</p>
                        <p className="text-[10px] font-bold text-summer-space/60 uppercase">
                          {formatSize(item.file.size)} 
                          {item.newSize && ` ➔ ${formatSize(item.newSize)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {item.status === 'idle' && (
                        <span className="px-2 py-0.5 bg-zinc-200 border border-summer-space text-[10px] font-black uppercase text-zinc-600">Pending</span>
                      )}
                      {item.status === 'converting' && (
                        <span className="px-2 py-0.5 bg-summer-amber border border-summer-space text-[10px] font-black uppercase text-summer-space flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Converting
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className="px-2 py-0.5 bg-emerald-400 border border-summer-space text-[10px] font-black uppercase text-summer-space">Ready</span>
                      )}
                      {item.status === 'error' && (
                        <span className="px-2 py-0.5 bg-rose-400 border border-summer-space text-[10px] font-black uppercase text-white" title={item.error}>Failed</span>
                      )}
                      
                      <button onClick={() => removeBatchItem(item.id)} className="text-xs font-black uppercase text-rose-500 hover:text-rose-700 underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Operations footer */}
              <div className="border-t-[3px] border-summer-space pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-sm uppercase text-summer-space">Bulk Online Conversion</h4>
                  <p className="text-xs text-summer-space/70 font-bold">Our servers will convert your files rapidly online.</p>
                </div>

                {batchStatus !== 'success' ? (
                  <button 
                    onClick={handleBatchConvert}
                    disabled={batchStatus === 'converting'}
                    className="bg-summer-tiger hover:bg-summer-amber text-summer-space px-8 py-3.5 border-[3px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_#023047] disabled:opacity-50 flex items-center gap-2"
                  >
                    {batchStatus === 'converting' ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing pool...</> : <><RefreshCw className="w-4 h-4" /> Convert All Files</>}
                  </button>
                ) : (
                  batchZipUrl && (
                    <a 
                      href={batchZipUrl} 
                      download={targetFormat === 'application/pdf' && mergeToPdf ? "merged_document.pdf" : "converted_images.zip"}
                      className="bg-emerald-400 hover:bg-emerald-500 text-summer-space px-8 py-3.5 border-[3px] border-summer-space font-black uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_#023047] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> {targetFormat === 'application/pdf' && mergeToPdf ? "Download Merged PDF" : "Download Converted ZIP"}
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
