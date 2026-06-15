import UnitConverterClient from './UnitConverterClient';
import AdUnit from '@/components/AdUnit';

export const metadata = {
  title: 'Ultimate Free Online Unit Converter | All Measurement Conversions | ZeroNode',
  description: 'Best free online unit converter. Instantly convert length, weight, temperature, fluid dynamics, electromagnetism, mechanics, and 100+ scientific engineering units without downloading apps.',
  keywords: 'unit converter, free online converter, length converter, weight converter, temperature converter, scientific converter, engineering units, calculate metrics'
};

export default function UnitConverterPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ultimate Unit Converter",
    "operatingSystem": "All",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I convert Celsius to Fahrenheit?",
        "acceptedAnswer": { "@type": "Answer", "text": "Simply select 'Heat' or 'Common Converters' domain, choose 'Temperature', enter your value in Celsius, and it will instantly output the exact Fahrenheit equivalent using the standard formula." }
      },
      {
        "@type": "Question",
        "name": "How to convert pounds to kilograms?",
        "acceptedAnswer": { "@type": "Answer", "text": "Select 'Mass' under 'Common Converters'. Enter your weight in Pounds (lbs), and our tool instantly calculates the exact Kilogram (kg) measurement. It also supports ounces, stone, and metric tons." }
      },
      {
        "@type": "Question",
        "name": "Does this tool support complex engineering units?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes! We support over 100 specific engineering properties including Kinematic Viscosity, Thermal Conductivity, Torque, Illuminance, and Magnetic Flux, making it perfect for physics students and professional engineers." }
      }
    ]
  };

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* TOP LEADERBOARD AD */}
      <div className="flex justify-center mb-10 w-full">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-summer-space mb-3" style={{ textShadow: '3px 3px 0px #fb8500' }}>
          Ultimate Online Unit Converter
        </h1>
        <p className="text-summer-space/80 font-bold border-b-[3px] border-summer-space inline-block pb-1">
          Instant, accurate conversions for engineering, science, and everyday life.
        </p>
      </header>

      <UnitConverterClient />

      {/* FOOTER AD */}
      <div className="flex justify-center w-full mt-16">
        <AdUnit width={728} height={90} className="hidden md:flex" />
        <AdUnit width={320} height={50} className="md:hidden" />
      </div>

      {/* SEO INFO BLOCK */}
      <div className="mt-16 bg-white border-[4px] border-summer-space p-8 md:p-12 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-6 border-b-[4px] border-summer-space pb-2">The Best Free Online Unit Converter for Everyone</h2>
        <p className="font-bold text-summer-space/80 mb-6 text-lg">
          Welcome to the most comprehensive <strong>free online unit conversion tool</strong> on the web. Whether you are an engineer dealing with complex fluid dynamics, a student studying physics, or a home cook needing to convert baking measurements, our all-in-one unit converter provides instant, highly accurate results. Avoid the hassle of manual calculations or downloading heavy, ad-ridden apps to your phone. We bring over 100 different unit categories right to your browser.
        </p>
        
        <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Common Measurement Conversions Made Easy</h3>
        <p className="font-bold text-summer-space/80 mb-6">
          Everyday life often requires quick mental math. How many miles are in a kilometer? How many milliliters in a US Gallon? Our tool instantly answers these questions. Simply navigate to the <strong>Common Converters</strong> domain to access:
        </p>
        <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
          <li><strong>Length & Distance:</strong> Meters, Kilometers, Miles, Yards, Feet, Inches, and even Astronomical Units (AU) and Parsecs.</li>
          <li><strong>Weight & Mass:</strong> Kilograms, Grams, Pounds (lbs), Ounces (oz), Stone, Carats, and Metric Tons.</li>
          <li><strong>Temperature:</strong> Celsius, Fahrenheit, Kelvin, and Rankine scales with exact, non-linear formula mapping.</li>
          <li><strong>Volume & Capacity:</strong> Liters, Gallons (US/UK), Quarts, Pints, Cups, Tablespoons, Teaspoons, and Drops.</li>
        </ul>

        <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Advanced Engineering and Scientific Conversions</h3>
        <p className="font-bold text-summer-space/80 mb-6">
          What separates our tool from a basic calculator is our specialized conversion engine designed for STEM professionals. We provide full coverage for difficult-to-find advanced scientific disciplines:
        </p>
        <ul className="list-disc pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
          <li><strong>Thermodynamics & Heat:</strong> Heat Flux Density, Thermal Conductivity (W/(m·K) to BTU/(h·ft·°F)), Specific Heat Capacity.</li>
          <li><strong>Fluid Mechanics:</strong> Dynamic Viscosity (Pascal-seconds to Poise), Volumetric Flow Rate (Cubic meters/sec to US Gallons/min).</li>
          <li><strong>Electromagnetism:</strong> Magnetic Flux (Webers, Maxwells), Electric Charge (Coulombs, Ampere-hours), and Illuminance (Lux, Foot-candles).</li>
          <li><strong>Radiology & Nuclear:</strong> Radioactivity (Becquerels, Curies, Rutherfords) and Radiation Absorbed Dose (Grays, Rads).</li>
        </ul>

        <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">How to Convert Units Accurately Online</h3>
        <ol className="list-decimal pl-8 font-bold text-summer-space/80 mb-6 space-y-2">
          <li><strong>Select a Domain:</strong> Choose a high-level category like "Mechanics" or "Fluids" from the top horizontal bar.</li>
          <li><strong>Select a Property:</strong> Choose the specific property you are measuring from the left sidebar (e.g., "Density" or "Torque").</li>
          <li><strong>Input Your Value:</strong> Type your number into the "From" box.</li>
          <li><strong>Choose Units:</strong> Select your starting unit and target unit from the dropdowns. The conversion happens instantly as you type!</li>
        </ol>

        <h3 className="text-2xl font-black uppercase tracking-tighter text-summer-space mb-4 mt-8">Fast, Accurate, and Privacy-Focused</h3>
        <p className="font-bold text-summer-space/80">
          Accuracy is paramount when converting units for professional work or academic research. Our robust <em>Online Precision Mode</em> formula engine handles complex ratios, floating-point arithmetic, and extreme scientific notation effortlessly. Because it runs directly in your browser, calculations are lightning fast, and your input data is completely secure. Bookmark this page to ensure you always have a reliable, universal measurement calculator ready for your next project!
        </p>
      </div>

    </div>
  );
}
