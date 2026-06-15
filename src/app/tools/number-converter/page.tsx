import NumberConverterClient from './NumberConverterClient';
import AdUnit from '@/components/AdUnit';

export const metadata = {
  title: 'Number Converter | Zero Ping',
  description: 'Convert between Binary, Decimal, Hex, Octal, ASCII, Roman Numerals, Fractions and more with calculation steps.',
};

export default function NumberConverterPage() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>
          Number Converter
        </h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">
          Base conversions, ASCII, fractions, and Roman numerals.
        </p>
      </header>

      <NumberConverterClient />

      {/* FOOTER AD */}
      <div className="flex justify-center w-full mt-16">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      {/* SEO INFO BLOCK */}
      <div className="mt-16 bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4 border-b-[4px] border-summer-space pb-2">How Our Online Number Converter Works</h2>
        <p className="font-bold text-summer-space/80 mb-6 text-lg">
          Converting numbers between different bases and formats shouldn't require complex spreadsheet formulas or desktop calculators. Our <strong>free online number converter</strong> makes it incredibly simple to instantly translate values between Binary (Base-2), Octal (Base-8), Decimal (Base-10), and Hexadecimal (Base-16) systems. We also support ASCII text, Roman Numerals, and Fraction conversions!
        </p>
        
        <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Why Convert Number Bases?</h3>
        <p className="font-bold text-summer-space/80 mb-6">
          In computer science and digital electronics, different numbering systems are used for different purposes. While humans naturally count in Decimal (Base-10), computers operate entirely in Binary (Base-2), representing all data as 1s and 0s. 
        </p>
        <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
          <li><strong>Hexadecimal (Base-16):</strong> Widely used by programmers because it provides a human-friendly shorthand for binary. It's heavily used in HTML color codes (like #FF0000), MAC addresses, and memory addresses.</li>
          <li><strong>Octal (Base-8):</strong> Historically used in older computing systems and still relevant for UNIX file permissions (e.g., chmod 777).</li>
          <li><strong>ASCII:</strong> Essential for converting binary computer data back into readable text characters.</li>
        </ul>

        <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Real-time Step-by-Step Calculations</h3>
        <p className="font-bold text-summer-space/80">
          Unlike basic calculators that just spit out a final answer, our advanced tool shows you the step-by-step mathematical working. If you are a computer science student learning how to manually convert Decimal to Binary using the "Divide by 2" method, our tool will generate the exact calculation steps so you can learn the underlying math and verify your homework assignments. 
        </p>
      </div>
    </div>
  );
}
