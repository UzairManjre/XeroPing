export default function AdUnit({ width, height, className = "" }: { width: number, height: number, className?: string }) {
  return (
    <div 
      className={`relative bg-zinc-50 border-[3px] border-dashed border-zinc-300 flex flex-col items-center justify-center text-center overflow-hidden ${className}`}
      style={{ 
        width: '100%', 
        maxWidth: `${width}px`, 
        minHeight: `${height}px`, 
        aspectRatio: `${width} / ${height}` 
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <span className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] font-black px-3 py-1 bg-white border-[2px] border-zinc-300 shadow-sm">Advertisement</span>
      </div>
    </div>
  );
}
