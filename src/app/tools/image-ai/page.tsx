'use client';

import { useState, useRef, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { UploadCloud, Sparkles, Download, AlertCircle, Loader2, Image as ImageIcon, Settings2, Trash2, RefreshCw } from 'lucide-react';
import AdUnit from '@/components/AdUnit';

export default function ImageAi() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Status: idle -> loading_models -> processing -> success -> error
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Editing Options
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [bgColor, setBgColor] = useState('#ffb703'); // default Amber
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);

  // Result
  const [transparentBlob, setTransparentBlob] = useState<Blob | null>(null);
  const [transparentUrl, setTransparentUrl] = useState<string | null>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (bgImageFile) {
      const url = URL.createObjectURL(bgImageFile);
      setBgImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBgImagePreview(null);
    }
  }, [bgImageFile]);

  // Redraw composition whenever background parameters or options change
  useEffect(() => {
    if (!transparentBlob) return;

    const img = new Image();
    img.src = URL.createObjectURL(transparentBlob);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw background
      if (bgMode === 'transparent') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'color') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'image' && bgImagePreview) {
        const bgImg = new Image();
        bgImg.src = bgImagePreview;
        bgImg.onload = () => {
          // Draw scaled background image to fill canvas (cover style)
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const x = (canvas.width - bgImg.width * scale) / 2;
          const y = (canvas.height - bgImg.height * scale) / 2;
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
          
          // Draw subject
          ctx.drawImage(img, 0, 0);
          setCompositeUrl(canvas.toDataURL('image/png'));
        };
        return;
      } else {
        // Fallback to transparent style grid
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw foreground subject
      ctx.drawImage(img, 0, 0);
      setCompositeUrl(canvas.toDataURL('image/png'));
    };
  }, [transparentBlob, bgMode, bgColor, bgImagePreview]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processSelection(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processSelection(e.target.files[0]);
  };

  const processSelection = (targetFile: File) => {
    if (!targetFile.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    setFile(targetFile);
    setStatus('idle');
    setTransparentBlob(null);
    setTransparentUrl(null);
    setCompositeUrl(null);
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    setStatus('loading');
    setProgressPct(0);
    setProgressMsg('Loading AI model...');

    try {
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          const pct = Math.round((current / total) * 100);
          setProgressPct(pct);
          if (key.includes('fetch')) {
            setProgressMsg(`Downloading model files... (${pct}%)`);
          } else {
            setProgressMsg(`Isolating subject from background... (${pct}%)`);
          }
        }
      });

      setTransparentBlob(blob);
      setTransparentUrl(URL.createObjectURL(blob));
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Background removal failed. Please check file format.');
    }
  };

  const downloadImage = () => {
    const url = bgMode === 'transparent' ? transparentUrl : compositeUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `no_bg_${file?.name.substring(0, file.name.lastIndexOf('.'))}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>Free Online Background Remover</h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">Instantly remove backgrounds from images online for free. Fast, easy, and reliable.</p>
      </header>

      {/* UPLOAD ZONE */}
      {status === 'idle' && !transparentUrl && (
        <div className="max-w-2xl mx-auto">
          <div 
            className={`relative border-[4px] border-dashed border-summer-space p-12 text-center transition-all shadow-brutal cursor-pointer ${
              isDragging ? 'bg-summer-sky border-solid' : 'bg-summer-amber hover:bg-summer-tiger hover:-translate-y-1 hover:shadow-brutal-lg'
            }`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            <div className="flex flex-col items-center justify-center space-y-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="w-40 h-40 object-cover border-[4px] border-summer-space shadow-brutal mb-2" />
              ) : (
                <div className="w-20 h-20 bg-summer-sea border-[4px] border-summer-space flex items-center justify-center mb-2 shadow-brutal">
                  <UploadCloud className="w-10 h-10 text-summer-space stroke-[2.5px]" />
                </div>
              )}
              <div>
                <span className="text-summer-space font-black text-2xl uppercase tracking-tighter block">
                  {file ? file.name : 'Click to upload portrait'}
                </span>
                <span className="text-summer-space/80 font-bold text-lg">or drag and drop</span>
              </div>
              <p className="inline-block px-3 py-1 bg-summer-space text-summer-sky text-xs font-black uppercase tracking-widest border-[2px] border-summer-space shadow-sm">
                JPG, PNG, WebP up to 15MB
              </p>
            </div>
          </div>
          
          {file && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={handleRemoveBackground}
                className="bg-summer-tiger hover:bg-summer-amber text-summer-space px-12 py-5 border-[4px] border-summer-space font-black uppercase tracking-widest text-xl transition-all shadow-[6px_6px_0px_#023047] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6 stroke-[3px]" /> Remove Background Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* PROCESSING STATE */}
      {status === 'loading' && (
        <div className="max-w-2xl mx-auto p-12 border-[4px] border-summer-space shadow-brutal text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
          {previewUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Processing" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[2px]" />
              <div className="absolute inset-0 bg-white/80" />
            </>
          )}
          <div className="relative z-10 flex flex-col items-center w-full">
            <Loader2 className="w-16 h-16 text-summer-tiger animate-spin mb-6 stroke-[3px]" />
            <p className="text-summer-space font-black text-xl uppercase tracking-widest mb-4">{progressMsg}</p>
            <div className="w-full bg-summer-sky border-[3px] border-summer-space h-6 rounded-none overflow-hidden relative shadow-sm max-w-md">
              <div 
                className="bg-summer-tiger h-full transition-all duration-300 border-r-[3px] border-summer-space"
                style={{ width: `${progressPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-summer-space">{progressPct}%</span>
            </div>
            <p className="text-xs font-bold text-summer-space/80 mt-4 uppercase tracking-wider bg-white/50 px-3 py-1 border-[2px] border-summer-space">
              Models will cache in your browser for instant future runs.
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS/RESULTS DISPLAY */}
      {status === 'success' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: VISUAL PREVIEW */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal relative">
              <div className="p-4 border-b-[4px] border-summer-space bg-summer-amber flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 stroke-[3px]" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Isolated Subject</h3>
                </div>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-xs font-black uppercase bg-summer-space text-white px-2 py-1 border-[2px] border-summer-space hover:bg-white hover:text-summer-space transition-colors shadow-sm"
                >
                  Reset
                </button>
              </div>
              
              <div className="p-4 bg-zinc-200 aspect-square relative flex items-center justify-center overflow-hidden">
                {/* Transparency pattern background indicator */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', 
                    backgroundSize: '20px 20px', 
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
                  }}
                />
                
                {/* Drawn Composite Canvas */}
                <canvas ref={canvasRef} className="hidden" />

                {bgMode === 'transparent' && transparentUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={transparentUrl} alt="Transparent Subject" className="max-w-full max-h-full object-contain relative z-10" />
                )}

                {bgMode === 'color' && compositeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={compositeUrl} alt="Colored Subject" className="max-w-full max-h-full object-contain relative z-10" />
                )}

                {bgMode === 'image' && compositeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={compositeUrl} alt="Composited Subject" className="max-w-full max-h-full object-contain relative z-10" />
                )}
              </div>

              <div className="p-4 border-t-[4px] border-summer-space bg-summer-sea flex justify-between items-center text-sm">
                <div>
                  <span className="block font-black uppercase tracking-widest text-xs">Dimensions</span>
                  <span className="font-bold">{file?.name}</span>
                </div>
                <div className="text-right">
                  <span className="block font-black uppercase tracking-widest text-xs">Format</span>
                  <span className="font-bold">PNG (Lossless)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTROL PANEL */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-summer-sky border-[4px] border-summer-space shadow-brutal-lg relative">
              <div className="p-6 border-b-[4px] border-summer-space bg-summer-amber flex items-center gap-3">
                <div className="w-10 h-10 bg-summer-space flex items-center justify-center border-[2px] border-summer-space">
                  <Settings2 className="w-6 h-6 text-summer-amber stroke-[2.5px]" />
                </div>
                <h2 className="text-2xl font-black text-summer-space uppercase tracking-tight">Background Settings</h2>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* BG Mode Tabs */}
                <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal">
                  <label className="block text-summer-space font-black uppercase tracking-widest text-sm mb-3">Replacement Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['transparent', 'color', 'image'] as const).map(mode => (
                      <button 
                        key={mode}
                        onClick={() => setBgMode(mode)}
                        className={`py-2 px-1 border-[3px] border-summer-space font-black uppercase tracking-widest text-xs transition-all shadow-sm ${
                          bgMode === mode ? 'bg-summer-space text-white scale-105 shadow-brutal' : 'bg-white text-summer-space hover:bg-summer-sky'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Mode Options */}
                {bgMode === 'color' && (
                  <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal animate-in fade-in slide-in-from-top-2">
                    <label className="block text-summer-space font-black uppercase tracking-widest text-sm mb-3">Select Background Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)} 
                        className="w-16 h-16 bg-white border-[3px] border-summer-space cursor-pointer"
                      />
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={bgColor} 
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full p-2 border-[3px] border-summer-space font-mono text-sm font-bold uppercase focus:outline-none"
                        />
                        <span className="text-xs font-bold text-summer-space/60 mt-1 block uppercase tracking-widest">HEX Code</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Image Mode Options */}
                {bgMode === 'image' && (
                  <div className="p-4 bg-white border-[4px] border-summer-space shadow-brutal animate-in fade-in slide-in-from-top-2 space-y-4">
                    <label className="block text-summer-space font-black uppercase tracking-widest text-sm mb-1">Upload Background Image</label>
                    
                    {!bgImageFile ? (
                      <div 
                        onClick={() => bgImageInputRef.current?.click()}
                        className="border-[3px] border-dashed border-summer-space p-6 text-center cursor-pointer hover:bg-summer-sky transition-colors"
                      >
                        <input 
                          type="file" 
                          ref={bgImageInputRef} 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/webp" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) setBgImageFile(e.target.files[0]);
                          }}
                        />
                        <ImageIcon className="w-8 h-8 text-summer-space mx-auto mb-2" />
                        <span className="text-xs font-black uppercase text-summer-space">Select image file</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 border-[2px] border-summer-space bg-summer-sky">
                        <span className="font-bold text-xs truncate max-w-[200px]">{bgImageFile.name}</span>
                        <button 
                          onClick={() => { setBgImageFile(null); setBgImagePreview(null); }}
                          className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACTION BUTTON */}
              <div className="p-6 bg-summer-space border-t-[4px] border-summer-space text-right">
                <button 
                  onClick={downloadImage} 
                  className="bg-summer-amber hover:bg-summer-tiger text-summer-space px-8 py-4 border-[3px] border-summer-space font-black uppercase tracking-widest text-lg transition-all shadow-[4px_4px_0px_#8ecae6] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5 stroke-[3px]" /> Download Image
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
          <div>
            <h4 className="text-white font-black uppercase tracking-tight">Processing Error</h4>
            <p className="text-white/80 font-bold text-sm">{errorMsg}</p>
          </div>
          <button 
            onClick={() => setStatus('idle')}
            className="ml-auto text-xs font-black uppercase bg-white text-summer-space px-3 py-1.5 border-[2px] border-summer-space hover:bg-summer-sky transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* FOOTER AD */}
      {status === 'success' && (
        <div className="flex justify-center w-full mt-10">
          <AdUnit width={728} height={90} className="hidden md:flex" />
          <AdUnit width={320} height={50} className="md:hidden" />
        </div>
      )}

      {/* SEO INFO BLOCK */}
      <div className="mt-16 bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">What is an Image Background Remover?</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Removing backgrounds from images has never been easier. Whether you are an e-commerce seller looking to create clean product photos, a graphic designer creating composites, or just someone looking to make a fun meme, our free online background remover is the perfect tool. By utilizing advanced AI algorithms, we instantly detect the subject of your photo and separate it from the background with incredible precision.
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">Why Remove Image Backgrounds?</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Transparent backgrounds are essential for modern web design and digital marketing. They allow you to place your subjects onto any color, texture, or scene. Common use cases include placing product images on a pure white background for Amazon, eBay, or Shopify stores. Additionally, creating YouTube thumbnails often requires a clean cutout of a person's face or body.
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">Best Formats: PNG vs WebP</h2>
        <p className="font-bold text-summer-space/80">
          When you remove a background, it is crucial to save your image in a format that supports transparency. The most common format is PNG, which provides lossless quality and full alpha-channel support. WebP is a newer format that also supports transparency but at a significantly smaller file size, making it ideal for web use. Our tool outputs high-quality transparent PNGs, ensuring your edges are crisp and your files are ready for any project.
        </p>
      </div>

    </div>
  );
}
