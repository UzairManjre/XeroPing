'use client';

import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import SignatureCanvas from 'react-signature-canvas';
import { UploadCloud, FileText, Download, AlertCircle, Loader2, FileArchive, Settings2, GripVertical, Image as ImageIcon, PenTool, X, ChevronLeft, ChevronRight, Type, Calendar, Trash2 } from 'lucide-react';
import AdUnit from '@/components/AdUnit';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}


type Tab = 'merge' | 'split' | 'rotate' | 'img2pdf' | 'metadata' | 'pdf2img' | 'watermark' | 'esign' | 'compress' | 'ocr';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl?: string;
}

interface PlacedElement {
  id: string;
  type: 'signature' | 'initials' | 'date' | 'text';
  value: string; // data URL for images, raw text for date/text
  page: number; // 1-indexed page
  x: number; // 0-1 relative
  y: number; // 0-1 relative
  width: number; // 0-1 relative
  height: number; // 0-1 relative
}

export default function PdfToolkitClient() {
  const [activeTab, setActiveTab] = useState<Tab>('merge');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedName, setProcessedName] = useState<string>('');
  
  // Large preview modal state
  const [largePreviewUrl, setLargePreviewUrl] = useState<string | null>(null);
  const [largePreviewName, setLargePreviewName] = useState<string>('');


  // Mode specific state
  const [splitRange, setSplitRange] = useState<string>('');
  const [rotation, setRotation] = useState<number>(90);
  const [metaInfo, setMetaInfo] = useState({ title: '', author: '', subject: '', keywords: '' });
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');

  // Multi-Page E-Sign state
  const [esignPageNum, setEsignPageNum] = useState<number>(1);
  const [esignTotalPages, setEsignTotalPages] = useState<number>(1);
  const [isSigPadOpen, setIsSigPadOpen] = useState(false);
  const [sigPadType, setSigPadType] = useState<'signature' | 'initials'>('signature');
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Text boxes inputs
  const [textInputVal, setTextInputVal] = useState('');
  
  // OCR / Text Extraction state
  const [extractedText, setExtractedText] = useState<string>('');

  // DOM Refs
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDragElement = useRef<{ id: string; startX: number; startY: number; startLeft: number; startTop: number } | null>(null);

  const resetState = () => {
    setStatus('idle');
    setProcessedUrl(null);
    setMessage('');
    setExtractedText('');
    setPlacedElements([]);
    setSelectedElementId(null);
    setEsignPageNum(1);
    setEsignTotalPages(1);
    setPreviewUrl(null);
  };

  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    setFiles([]);
    resetState();
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) handleFilesAdded(Array.from(e.dataTransfer.files));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesAdded(Array.from(e.target.files));
  };

  const generateFilePreview = async (pdfFile: PdfFile) => {
    if (pdfFile.file.type === 'application/pdf') {
      try {
        const buffer = await pdfFile.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
          await page.render({ canvasContext: context, viewport } as any).promise;
          const dataUrl = canvas.toDataURL('image/jpeg');
          setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, previewUrl: dataUrl } : f));
        }
      } catch (e) {
        console.error('Error generating preview:', e);
      }
    } else if (pdfFile.file.type.startsWith('image/')) {
      const dataUrl = URL.createObjectURL(pdfFile.file);
      setFiles(prev => prev.map(f => f.id === pdfFile.id ? { ...f, previewUrl: dataUrl } : f));
    }
  };

  const handleFilesAdded = (newFiles: File[]) => {
    resetState();
    const mapped: PdfFile[] = newFiles.map(f => ({ id: Math.random().toString(36).substring(7), file: f, name: f.name, size: f.size }));
    
    // Single file modes
    const singleModes: Tab[] = ['split', 'rotate', 'metadata', 'pdf2img', 'watermark', 'esign', 'compress', 'ocr'];
    let filesToUse: PdfFile[] = [];
    if (singleModes.includes(activeTab)) {
      const valid = mapped.filter(f => f.file.type === 'application/pdf');
      if (valid.length > 0) {
        filesToUse = [valid[0]];
      }
    } else if (activeTab === 'merge') {
      const valid = mapped.filter(f => f.file.type === 'application/pdf');
      filesToUse = valid;
    } else if (activeTab === 'img2pdf') {
      const valid = mapped.filter(f => f.file.type.startsWith('image/'));
      filesToUse = valid;
    }

    if (filesToUse.length === 0) return;

    if (activeTab === 'merge' || activeTab === 'img2pdf') {
      setFiles(prev => {
        const updated = [...prev, ...filesToUse];
        filesToUse.forEach(f => generateFilePreview(f));
        return updated;
      });
    } else {
      setFiles(filesToUse);
      filesToUse.forEach(f => generateFilePreview(f));
    }

    if (activeTab === 'esign') {
      loadPdfDocDetails(filesToUse[0].file);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index - 1];
    newFiles[index - 1] = temp;
    setFiles(newFiles);
  };

  // E-Sign Doc Loader
  const loadPdfDocDetails = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setEsignTotalPages(pdf.numPages);
      setEsignPageNum(1);
      generatePagePreview(pdf, 1);
    } catch (e) {
      console.error('Error loading PDF details:', e);
    }
  };

  // E-Sign Page Preview Generation
  const generatePagePreview = async (pdfDoc: any, pageNum: number) => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        setPreviewUrl(canvas.toDataURL('image/jpeg'));
      }
    } catch (e) {
      console.error('Preview render error:', e);
    }
  };

  // Switch E-Sign Preview Pages
  const changeEsignPage = async (offset: number) => {
    if (files.length === 0) return;
    const nextVal = esignPageNum + offset;
    if (nextVal >= 1 && nextVal <= esignTotalPages) {
      setEsignPageNum(nextVal);
      const buffer = await files[0].file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      generatePagePreview(pdf, nextVal);
    }
  };

  // Element placement functions
  const addTextElement = () => {
    if (!textInputVal.trim()) return;
    const id = Math.random().toString(36).substring(7);
    const newEl: PlacedElement = {
      id,
      type: 'text',
      value: textInputVal,
      page: esignPageNum,
      x: 0.3,
      y: 0.3,
      width: 0.2,
      height: 0.04
    };
    setPlacedElements(prev => [...prev, newEl]);
    setTextInputVal('');
  };

  const addDateElement = () => {
    const id = Math.random().toString(36).substring(7);
    const dateStr = new Date().toLocaleDateString();
    const newEl: PlacedElement = {
      id,
      type: 'date',
      value: dateStr,
      page: esignPageNum,
      x: 0.3,
      y: 0.3,
      width: 0.15,
      height: 0.03
    };
    setPlacedElements(prev => [...prev, newEl]);
  };

  const addSignatureImageElement = (dataUrl: string, type: 'signature' | 'initials') => {
    const id = Math.random().toString(36).substring(7);
    const newEl: PlacedElement = {
      id,
      type,
      value: dataUrl,
      page: esignPageNum,
      x: 0.3,
      y: 0.3,
      width: type === 'signature' ? 0.25 : 0.15,
      height: type === 'signature' ? 0.1 : 0.08
    };
    setPlacedElements(prev => [...prev, newEl]);
  };

  // Placed Elements Handlers (Dragging)
  const startDraggingElement = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedElementId(id);
    const item = placedElements.find(el => el.id === id);
    if (!item || !previewContainerRef.current) return;
    
    const containerRect = previewContainerRef.current.getBoundingClientRect();
    
    activeDragElement.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: item.x * containerRect.width,
      startTop: item.y * containerRect.height
    };
  };

  // Dragging Mouse Moves
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeDragElement.current || !previewContainerRef.current) return;
      const drag = activeDragElement.current;
      const containerRect = previewContainerRef.current.getBoundingClientRect();
      
      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;
      
      let left = drag.startLeft + deltaX;
      let top = drag.startTop + deltaY;
      
      // Keep boundaries
      left = Math.max(0, Math.min(left, containerRect.width));
      top = Math.max(0, Math.min(top, containerRect.height));
      
      setPlacedElements(prev => prev.map(el => {
        if (el.id === drag.id) {
          return {
            ...el,
            x: left / containerRect.width,
            y: top / containerRect.height
          };
        }
        return el;
      }));
    };

    const handleGlobalMouseUp = () => {
      activeDragElement.current = null;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [placedElements]);

  // Remove element
  const deleteElement = (id: string) => {
    setPlacedElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // --- PDF OVERHAULED OPERATIONS ---

  const handleExtractText = async () => {
    if (files.length === 0) return;
    setStatus('processing');
    setMessage('Extracting text content streams...');
    try {
      const buffer = await files[0].file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += `--- PAGE ${i} ---\n${pageText}\n\n`;
      }
      setExtractedText(text);
      setStatus('success');
      setMessage('Text extraction complete.');
    } catch (err: any) {
      setStatus('error');
      setMessage(`Extraction failed: ${err.message || String(err)}`);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setStatus('processing');
    setMessage('Processing document...');

    try {
      if (activeTab === 'merge') {
        const mergedPdf = await PDFDocument.create();
        for (const f of files) {
          const buffer = await f.file.arrayBuffer();
          const pdf = await PDFDocument.load(buffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'merged_document.pdf');

      } else if (activeTab === 'split') {
        const buffer = await files[0].file.arrayBuffer();
        const srcPdf = await PDFDocument.load(buffer);
        const newPdf = await PDFDocument.create();
        
        let pagesToKeep: number[] = [];
        if (!splitRange.trim()) {
           pagesToKeep = [0];
        } else {
           const parts = splitRange.split(',');
           for (const part of parts) {
             const range = part.trim().split('-');
             if (range.length === 2) {
               const start = parseInt(range[0]) - 1;
               const end = parseInt(range[1]) - 1;
               for (let i = start; i <= end; i++) pagesToKeep.push(i);
             } else {
               pagesToKeep.push(parseInt(part.trim()) - 1);
             }
           }
        }
        
        const validPages = pagesToKeep.filter(p => !isNaN(p) && p >= 0 && p < srcPdf.getPageCount());
        if (validPages.length === 0) throw new Error('Invalid page range.');

        const copiedPages = await newPdf.copyPages(srcPdf, validPages);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'extracted_pages.pdf');

      } else if (activeTab === 'rotate') {
        const buffer = await files[0].file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const pages = pdf.getPages();
        pages.forEach(page => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotation));
        });
        const pdfBytes = await pdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'rotated_document.pdf');

      } else if (activeTab === 'metadata') {
        const buffer = await files[0].file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        if (metaInfo.title) pdf.setTitle(metaInfo.title);
        if (metaInfo.author) pdf.setAuthor(metaInfo.author);
        if (metaInfo.subject) pdf.setSubject(metaInfo.subject);
        if (metaInfo.keywords) pdf.setKeywords(metaInfo.keywords.split(',').map(k => k.trim()));
        const pdfBytes = await pdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'metadata_updated.pdf');

      } else if (activeTab === 'img2pdf') {
        const pdf = await PDFDocument.create();
        for (const f of files) {
          const buffer = await f.file.arrayBuffer();
          let image;
          if (f.file.type === 'image/jpeg' || f.file.type === 'image/jpg') image = await pdf.embedJpg(buffer);
          else if (f.file.type === 'image/png') image = await pdf.embedPng(buffer);
          else throw new Error('Only JPEG and PNG are currently supported for direct PDF embedding.');
          
          const page = pdf.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        const pdfBytes = await pdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'images_to_pdf.pdf');
        
      } else if (activeTab === 'watermark') {
        const buffer = await files[0].file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const pages = pdf.getPages();
        
        pages.forEach(page => {
          const { width, height } = page.getSize();
          const textSize = 50;
          const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
          
          page.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: textSize,
            font: font,
            color: rgb(0.95, 0.1, 0.1),
            opacity: 0.3,
            rotate: degrees(45),
          });
        });
        const pdfBytes = await pdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'watermarked_document.pdf');
        
      } else if (activeTab === 'pdf2img') {
        const buffer = await files[0].file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const zip = new JSZip();
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (!context) throw new Error("Could not create canvas context");
          await page.render({ canvasContext: context, viewport: viewport } as any).promise;
          
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
          if (blob) zip.file(`page_${i}.jpg`, blob);
        }
        
        const zipContent = await zip.generateAsync({ type: 'blob' });
        setProcessedUrl(URL.createObjectURL(zipContent));
        setProcessedName('pdf_images.zip');
        setStatus('success');
        setMessage('Processing Complete');

      } else if (activeTab === 'compress') {
        const buffer = await files[0].file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        
        // Lossless structural compression & cross-reference streams optimization
        const pdfBytes = await pdf.save({ 
          useObjectStreams: true
        });
        
        triggerDownload(pdfBytes, 'compressed_document.pdf');

      } else if (activeTab === 'esign') {
        if (placedElements.length === 0) throw new Error('Please place at least one signature/date/text block.');
        const buffer = await files[0].file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        
        for (const el of placedElements) {
          const page = pdf.getPage(el.page - 1);
          const { width, height } = page.getSize();
          
          // PDF coordinate space has bottom-left origin. Element coordinates are top-left origin.
          const pdfX = el.x * width;
          const pdfY = height - (el.y * height) - (el.height * height);
          const pdfW = el.width * width;
          const pdfH = el.height * height;
          
          if (el.type === 'signature' || el.type === 'initials') {
            const sigBytes = await fetch(el.value).then(res => res.arrayBuffer());
            const pngImage = await pdf.embedPng(sigBytes);
            page.drawImage(pngImage, {
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH
            });
          } else {
            const font = await pdf.embedFont(StandardFonts.HelveticaBold);
            page.drawText(el.value, {
              x: pdfX,
              y: pdfY + 4,
              size: Math.max(10, pdfH * 0.7),
              font: font,
              color: rgb(0.01, 0.18, 0.27),
            });
          }
        }

        const pdfBytes = await pdf.save({ useObjectStreams: true });
        triggerDownload(pdfBytes, 'signed_document.pdf');
      }

    } catch (error: any) {
      setStatus('error');
      setMessage(`Operation failed: ${error.message || String(error)}`);
    }
  };

  const triggerDownload = (pdfBytes: Uint8Array, defaultName: string) => {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    setProcessedUrl(URL.createObjectURL(blob));
    setProcessedName(defaultName);
    setStatus('success');
    setMessage('Processing Complete');
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center animate-in fade-in">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>Free Online PDF Toolkit</h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Merge, split, edit metadata, compress, OCR, and sign PDF documents online for free.</p>
      </header>

      {/* TABBED INTERFACE */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(['merge', 'split', 'rotate', 'img2pdf', 'metadata', 'pdf2img', 'watermark', 'esign', 'compress', 'ocr'] as Tab[]).map((tab) => (
          <button 
            key={tab} onClick={() => handleTabSwitch(tab)}
            className={`px-4 py-2 md:px-5 md:py-2.5 border-[4px] border-summer-space font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-sm ${
              activeTab === tab ? 'bg-summer-tiger text-summer-space shadow-brutal translate-y-[-4px]' : 'bg-white text-summer-space hover:bg-summer-amber'
            }`}
          >
            {tab === 'img2pdf' ? 'IMG -> PDF' : tab === 'pdf2img' ? 'PDF -> IMG' : tab === 'esign' ? 'E-SIGN' : tab === 'ocr' ? 'TEXT EXTRACT' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: DROPZONE & FILE LIST */}
        <div className="lg:col-span-7 space-y-6">
          <div 
            className={`relative border-[4px] border-dashed border-summer-space p-8 text-center transition-all shadow-brutal cursor-pointer ${
              isDragging ? 'bg-summer-sky border-solid' : 'bg-white hover:bg-summer-amber'
            }`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" ref={fileInputRef} className="hidden" 
              multiple={activeTab === 'merge' || activeTab === 'img2pdf'}
              accept={activeTab === 'img2pdf' ? 'image/jpeg, image/png' : 'application/pdf'} 
              onChange={handleFileChange} 
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-summer-sea border-[4px] border-summer-space flex items-center justify-center shadow-brutal">
                {activeTab === 'img2pdf' ? <ImageIcon className="w-8 h-8 text-summer-space" /> : <UploadCloud className="w-8 h-8 text-summer-space stroke-[2.5px]" />}
              </div>
              <span className="text-summer-space font-black text-xl uppercase tracking-tighter block">
                {files.length === 0 ? `Upload ${activeTab === 'img2pdf' ? 'Images' : 'PDF'}` : 'Add More Files'}
              </span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-summer-sea border-[4px] border-summer-space p-4 shadow-brutal space-y-3">
              <h3 className="text-summer-space font-black uppercase tracking-widest text-sm border-b-[3px] border-summer-space pb-2">Selected Files</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {files.map((f, idx) => (
                  <div key={f.id} className="bg-white border-[3px] border-summer-space p-3 flex items-center justify-between shadow-sm gap-3">
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      {activeTab === 'merge' || activeTab === 'img2pdf' ? (
                        <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-summer-space hover:text-summer-tiger disabled:opacity-30 shrink-0">
                          <GripVertical className="w-5 h-5" />
                        </button>
                      ) : null}
                      
                      {/* Clickable Thumbnail Preview */}
                      <button 
                        onClick={() => {
                          if (f.previewUrl) {
                            setLargePreviewUrl(f.previewUrl);
                            setLargePreviewName(f.name);
                          }
                        }}
                        disabled={!f.previewUrl}
                        className={`w-14 h-16 bg-zinc-100 border-[2px] border-summer-space flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm transition-transform hover:scale-105 active:scale-95 ${f.previewUrl ? 'cursor-zoom-in' : 'cursor-not-allowed'}`}
                        title={f.previewUrl ? "Click to view full preview" : "Generating preview..."}
                      >
                        {f.previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-summer-space animate-spin" />
                        )}
                      </button>

                      <div className="overflow-hidden min-w-0 flex-1">
                        <span className="font-black text-sm text-summer-space truncate block">{f.name}</span>
                        <span className="text-[10px] font-bold text-zinc-500 block">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="text-xs font-black uppercase text-rose-500 hover:text-rose-700 underline shrink-0 ml-4">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONTROL PANEL */}
        <div className="lg:col-span-5">
          <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal-lg relative">
            
            <div className="p-6 border-b-[4px] border-summer-space bg-summer-tiger flex items-center gap-3">
              <div className="w-10 h-10 bg-summer-space flex items-center justify-center border-[2px] border-summer-space">
                <Settings2 className="w-6 h-6 text-summer-tiger stroke-[2.5px]" />
              </div>
              <h2 className="text-2xl font-black text-summer-space uppercase tracking-tight">Toolkit Settings</h2>
            </div>
            
            <div className="p-6 space-y-6">
              
              {activeTab === 'merge' && (
                <div className="text-summer-space font-bold">
                  Upload multiple PDFs, drag them into the correct order on the left, and click Merge to combine them into a single file.
                </div>
              )}

              {activeTab === 'split' && (
                <div className="space-y-3">
                  <label className="block text-summer-space font-black uppercase tracking-widest text-sm">Page Range to Extract</label>
                  <input 
                    type="text" placeholder="e.g. 1-3, 5, 8-10" 
                    value={splitRange} onChange={e => setSplitRange(e.target.value)}
                    className="w-full p-3 bg-white border-[3px] border-summer-space font-bold text-summer-space shadow-brutal focus:outline-none focus:bg-summer-amber transition-colors"
                  />
                  <p className="text-xs font-bold text-summer-space/70 uppercase tracking-widest">Leave empty to extract Page 1.</p>
                </div>
              )}

              {activeTab === 'rotate' && (
                <div className="space-y-3">
                  <label className="block text-summer-space font-black uppercase tracking-widest text-sm">Rotation Angle</label>
                  <div className="flex gap-3">
                    {[90, 180, 270].map(deg => (
                      <button 
                        key={deg} onClick={() => setRotation(deg)}
                        className={`flex-1 py-3 border-[3px] border-summer-space font-black uppercase text-sm transition-all ${
                          rotation === deg ? 'bg-summer-space text-white shadow-brutal scale-105' : 'bg-white text-summer-space hover:bg-summer-amber'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'metadata' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-summer-space font-black uppercase tracking-widest text-xs mb-1">Title</label>
                    <input type="text" value={metaInfo.title} onChange={e => setMetaInfo({...metaInfo, title: e.target.value})} className="w-full p-2 border-[3px] border-summer-space bg-white" />
                  </div>
                  <div>
                    <label className="block text-summer-space font-black uppercase tracking-widest text-xs mb-1">Author</label>
                    <input type="text" value={metaInfo.author} onChange={e => setMetaInfo({...metaInfo, author: e.target.value})} className="w-full p-2 border-[3px] border-summer-space bg-white" />
                  </div>
                  <div>
                    <label className="block text-summer-space font-black uppercase tracking-widest text-xs mb-1">Subject</label>
                    <input type="text" value={metaInfo.subject} onChange={e => setMetaInfo({...metaInfo, subject: e.target.value})} className="w-full p-2 border-[3px] border-summer-space bg-white" />
                  </div>
                  <div>
                    <label className="block text-summer-space font-black uppercase tracking-widest text-xs mb-1">Keywords (comma separated)</label>
                    <input type="text" value={metaInfo.keywords} onChange={e => setMetaInfo({...metaInfo, keywords: e.target.value})} className="w-full p-2 border-[3px] border-summer-space bg-white" />
                  </div>
                </div>
              )}

              {activeTab === 'img2pdf' && (
                <div className="text-summer-space font-bold">
                  Upload standard images (JPEG, PNG). Each image will be converted into a new page in the final PDF document.
                </div>
              )}

              {activeTab === 'pdf2img' && (
                <div className="text-summer-space font-bold">
                  Upload a PDF. We will extract every single page and package them into a single ZIP file containing high-quality JPEGs.
                </div>
              )}

              {activeTab === 'watermark' && (
                <div className="space-y-3">
                  <label className="block text-summer-space font-black uppercase tracking-widest text-sm">Watermark Text</label>
                  <input 
                    type="text" placeholder="e.g. CONFIDENTIAL" 
                    value={watermarkText} onChange={e => setWatermarkText(e.target.value)}
                    className="w-full p-3 bg-white border-[3px] border-summer-space font-bold text-summer-space shadow-brutal focus:outline-none focus:bg-summer-amber transition-colors uppercase"
                  />
                  <p className="text-xs font-bold text-summer-space/70 uppercase tracking-widest">A large red watermark will be stamped diagonally across every page.</p>
                </div>
              )}

              {activeTab === 'compress' && (
                <div className="text-summer-space font-bold space-y-2">
                  <p>Optimize files online quickly. This routine removes duplicate resources, formats dictionaries into compact Web streams, and reduces overall bloat.</p>
                  <p className="text-xs bg-white p-2 border-[2px] border-summer-space uppercase font-black text-summer-tiger">Recommended for files exceeding 5MB.</p>
                </div>
              )}

              {activeTab === 'ocr' && (
                <div className="space-y-4">
                  <p className="text-summer-space font-bold">Extract raw text lines from PDF pages instantly online.</p>
                  {files.length > 0 && (
                    <button 
                      onClick={handleExtractText}
                      className="bg-summer-amber border-[3px] border-summer-space font-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-summer-tiger transition-colors shadow-sm w-full"
                    >
                      Extract Plain Text
                    </button>
                  )}
                </div>
              )}

              {/* OVERHAULED MULTI-PAGE E-SIGN */}
              {activeTab === 'esign' && (
                <div className="space-y-4">
                  {files.length === 0 ? (
                    <div className="text-summer-space font-bold">Upload a PDF to sign it securely.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 bg-white p-2 border-[2px] border-summer-space">
                        <button 
                          onClick={() => { setSigPadType('signature'); setIsSigPadOpen(true); }}
                          className="bg-summer-space text-white px-2 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-summer-tiger hover:text-summer-space transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" /> + Signature
                        </button>
                        <button 
                          onClick={() => { setSigPadType('initials'); setIsSigPadOpen(true); }}
                          className="bg-summer-space text-white px-2 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-summer-tiger hover:text-summer-space transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" /> + Initials
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type text element..."
                          value={textInputVal}
                          onChange={e => setTextInputVal(e.target.value)}
                          className="flex-1 p-2 border-[2px] border-summer-space text-xs font-bold"
                        />
                        <button 
                          onClick={addTextElement}
                          className="bg-white border-[2px] border-summer-space px-3 py-1.5 text-xs font-black uppercase hover:bg-summer-sky"
                        >
                          <Type className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={addDateElement}
                          className="bg-white border-[2px] border-summer-space px-3 py-1.5 text-xs font-black uppercase hover:bg-summer-sky"
                          title="Place Current Date"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Element Manager */}
                      {placedElements.length > 0 && (
                        <div className="bg-white p-3 border-[2px] border-summer-space text-xs">
                          <p className="font-black uppercase tracking-widest text-summer-space border-b border-summer-space pb-1 mb-2">Placed Blocks ({placedElements.length})</p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {placedElements.map(el => (
                              <div key={el.id} className="flex justify-between items-center bg-zinc-50 p-1.5 border border-zinc-200">
                                <span className="capitalize font-bold text-zinc-600">{el.type} (Page {el.page})</span>
                                <button onClick={() => deleteElement(el.id)} className="text-rose-500 hover:text-rose-700">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PDF Multi-page Visual Previewer */}
                      {previewUrl && (
                        <div className="mt-4 border-[3px] border-summer-space bg-white relative overflow-hidden">
                          
                          {/* Top page navigator */}
                          <div className="bg-zinc-100 flex items-center justify-between px-3 py-2 border-b-[3px] border-summer-space">
                            <button 
                              onClick={() => changeEsignPage(-1)}
                              disabled={esignPageNum <= 1}
                              className="text-summer-space hover:text-summer-tiger disabled:opacity-35"
                            >
                              <ChevronLeft className="w-5 h-5 stroke-[2.5px]" />
                            </button>
                            <span className="font-black text-xs uppercase tracking-widest text-summer-space/75">
                              Page {esignPageNum} of {esignTotalPages}
                            </span>
                            <button 
                              onClick={() => changeEsignPage(1)}
                              disabled={esignPageNum >= esignTotalPages}
                              className="text-summer-space hover:text-summer-tiger disabled:opacity-35"
                            >
                              <ChevronRight className="w-5 h-5 stroke-[2.5px]" />
                            </button>
                          </div>

                          {/* Preview container */}
                          <div 
                            ref={previewContainerRef}
                            className="relative w-full select-none"
                            style={{ 
                              paddingBottom: '141.4%', 
                              backgroundImage: `url(${previewUrl})`, 
                              backgroundSize: 'contain', 
                              backgroundRepeat: 'no-repeat',
                              backgroundColor: '#f4f4f5'
                            }}
                          >
                            {/* Render placed elements on the current active page */}
                            {placedElements.filter(el => el.page === esignPageNum).map(el => (
                              <div 
                                key={el.id}
                                onMouseDown={(e) => startDraggingElement(e, el.id)}
                                className={`absolute cursor-move border-[2px] p-1 flex items-center justify-center ${
                                  selectedElementId === el.id ? 'border-summer-tiger bg-white/70 shadow-sm' : 'border-dashed border-summer-space bg-white/40'
                                }`}
                                style={{ 
                                  left: `${el.x * 100}%`, 
                                  top: `${el.y * 100}%`,
                                  width: `${el.width * 100}%`,
                                  height: `${el.height * 100}%`
                                }}
                              >
                                {el.type === 'signature' || el.type === 'initials' ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={el.value} alt={el.type} className="w-full h-full object-contain pointer-events-none" />
                                ) : (
                                  <span className="text-[10px] font-black text-summer-space text-center truncate w-full pointer-events-none select-none">
                                    {el.value}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>

            {/* ACTION BUTTON */}
            {activeTab !== 'ocr' && (
              <div className="p-6 bg-summer-space border-t-[4px] border-summer-space text-right">
                <button 
                  onClick={handleProcess} 
                  disabled={status === 'processing' || files.length === 0}
                  className="bg-summer-amber disabled:bg-summer-amber/50 hover:bg-summer-tiger text-summer-space px-8 py-4 border-[3px] border-summer-space font-black uppercase tracking-widest text-lg transition-all shadow-[4px_4px_0px_#8ecae6] hover:translate-y-1 hover:shadow-none w-full flex items-center justify-center gap-2"
                >
                  {status === 'processing' ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Settings2 className="w-5 h-5 stroke-[3px]" /> Execute Task</>}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TEXT OCR EXTRACTION PANEL */}
      {activeTab === 'ocr' && extractedText && (
        <div className="mt-8 border-[4px] border-summer-space bg-white p-6 shadow-brutal animate-in fade-in">
          <div className="flex justify-between items-center border-b-[3px] border-summer-space pb-3 mb-4">
            <span className="font-black uppercase tracking-widest text-sm text-summer-space">Extracted Text</span>
            <button 
              onClick={() => navigator.clipboard.writeText(extractedText)}
              className="text-xs font-black uppercase bg-summer-sky px-3 py-1.5 border-[2px] border-summer-space hover:bg-summer-amber"
            >
              Copy to Clipboard
            </button>
          </div>
          <textarea 
            readOnly 
            value={extractedText} 
            className="w-full h-96 p-4 border-[2px] border-summer-space font-mono text-sm bg-zinc-50 focus:outline-none"
          />
        </div>
      )}

      {/* ERROR STATUS */}
      {status === 'error' && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-rose-500 border-[4px] border-summer-space flex items-center gap-4 shadow-brutal-lg">
          <div className="w-10 h-10 bg-white border-[3px] border-summer-space flex items-center justify-center shadow-brutal shrink-0">
            <AlertCircle className="w-6 h-6 text-summer-space stroke-[3px]" />
          </div>
          <p className="text-white font-black uppercase tracking-tight">{message}</p>
        </div>
      )}

      {/* SUCCESS STATUS & DOWNLOADS */}
      {status === 'success' && processedUrl && (
        <div className="mt-12 space-y-10 max-w-4xl mx-auto">
          <div className="p-8 bg-emerald-400 border-[4px] border-summer-space flex flex-col md:flex-row items-center gap-6 justify-between shadow-brutal-lg animate-in slide-in-from-bottom-4 fade-in">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white border-[3px] border-summer-space flex items-center justify-center shadow-brutal shrink-0">
                <FileArchive className="w-8 h-8 text-summer-space stroke-[3px]" />
              </div>
              <div>
                <h4 className="text-summer-space font-black text-3xl uppercase tracking-tighter">Task Complete!</h4>
                <p className="text-sm font-bold text-summer-space/90 mt-1">Your PDF has been processed successfully online.</p>
              </div>
            </div>
            <a href={processedUrl} download={processedName} className="shrink-0 bg-white hover:bg-summer-sky text-summer-space px-8 py-4 border-[4px] border-summer-space font-black uppercase tracking-widest text-lg transition-all shadow-[6px_6px_0px_#023047] hover:translate-y-1 hover:shadow-none flex items-center gap-3">
              <Download className="w-6 h-6 stroke-[3px]" /> Download Output
            </a>
          </div>
        </div>
      )}

      {/* SIGNATURE PAD DRAWING MODAL */}
      {isSigPadOpen && (
        <div className="fixed inset-0 z-[100] bg-summer-space/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-summer-sky border-[6px] border-summer-space p-6 max-w-lg w-full shadow-[12px_12px_0px_#023047] relative">
            <button onClick={() => setIsSigPadOpen(false)} className="absolute top-4 right-4 text-summer-space hover:text-rose-500 transition-colors">
              <X className="w-8 h-8 stroke-[3px]" />
            </button>
            <h3 className="text-2xl font-black text-summer-space uppercase tracking-tighter mb-4">
              Draw {sigPadType === 'signature' ? 'Signature' : 'Initials'}
            </h3>
            
            <div className="bg-white border-[4px] border-summer-space mb-4 touch-none">
              <SignatureCanvas 
                ref={sigPadRef} 
                penColor="#023047"
                canvasProps={{ className: 'w-full h-48 cursor-crosshair' }} 
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => sigPadRef.current?.clear()}
                className="flex-1 py-3 bg-white border-[3px] border-summer-space font-black uppercase text-summer-space shadow-[3px_3px_0px_#023047] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Clear
              </button>
              <button 
                onClick={() => {
                  if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
                    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
                    addSignatureImageElement(dataUrl, sigPadType);
                    setIsSigPadOpen(false);
                  }
                }}
                className="flex-1 py-3 bg-summer-amber border-[3px] border-summer-space font-black uppercase text-summer-space shadow-[3px_3px_0px_#023047] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LARGE PREVIEW MODAL */}
      {largePreviewUrl && (
        <div className="fixed inset-0 z-[100] bg-summer-space/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setLargePreviewUrl(null)}>
          <div className="bg-white border-[6px] border-summer-space p-6 max-w-2xl w-full shadow-[12px_12px_0px_#023047] relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLargePreviewUrl(null)} className="absolute top-4 right-4 text-summer-space hover:text-rose-500 transition-colors">
              <X className="w-8 h-8 stroke-[3px]" />
            </button>
            <h3 className="text-2xl font-black text-summer-space uppercase tracking-tighter mb-4 truncate pr-8">
              Preview: {largePreviewName}
            </h3>
            <div className="border-[4px] border-summer-space bg-zinc-100 flex items-center justify-center overflow-auto max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={largePreviewUrl} alt={largePreviewName} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="mt-4 text-right">
              <button 
                onClick={() => setLargePreviewUrl(null)}
                className="px-6 py-2.5 bg-summer-space text-white border-[3px] border-summer-space font-black uppercase tracking-widest text-sm hover:bg-summer-tiger hover:text-summer-space transition-all shadow-[4px_4px_0px_#8ecae6] active:translate-y-1 active:shadow-none"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER AD */}
      <div className="flex justify-center w-full mt-10">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      {/* SEO content moved to page.tsx */}

    </div>
  );
}
