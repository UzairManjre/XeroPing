import DevToolkitClient, { Tab } from '../DevToolkitClient';

export function generateStaticParams() {
  return [
    { tool: 'jwt' },
    { tool: 'cron' },
    { tool: 'svg2jsx' },
    { tool: 'hash' },
  ];
}

const toolMap: Record<string, string> = {
  'jwt': 'Local JWT Decoder & Validator',
  'cron': 'Cron Expression Parser & Forecaster',
  'svg2jsx': 'SVG to React JSX Compiler',
  'hash': 'Crypto Hash Generator (MD5, SHA, Base64)'
};

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool;
  
  return {
    title: 'Local Dev Utilities | JWT Decoder, SVG to JSX, Hash Generator',
    description: 'Essential, zero-tracking utilities for engineers. Decode JWT payloads safely, convert SVGs to React JSX, and generate SHA-256 hashes entirely client-side.',
    alternates: {
      canonical: `https://xeroping.online/tools/dev-toolkit/${tool}`,
    },
    keywords: [
      'local jwt decoder', 'secure hash generator', 'md5 sha256 offline browser',
      'cron expression tester browser', 'zero tracking dev tools',
      'svg to react component converter', 'svg to jsx offline',
      'bcrypt hash generator local', 'decode base64 offline browser',
      'jwt debugger without upload', 'inspect jwt token browser',
      'jwt.io alternative private', 'hashify alternative offline',
      'decode jwt without sending to server', 'sha256 generator no internet',
    ].join(', '),
    openGraph: {
      title: 'Local Dev Utilities | JWT Decoder, SVG to JSX, Hash Generator',
      description: 'Decode JWTs, convert SVGs to JSX, and generate hashes locally. No logs. No tracking.',
      images: [{ url: 'https://xeroping.online/og/dev-toolkit.png', width: 1200, height: 630 }],
      url: `https://xeroping.online/tools/dev-toolkit/${tool}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Zero PingDev',
      title: 'Local Dev Utilities | JWT Decoder, SVG to JSX, Hash Generator',
      description: 'Decode JWTs, generate SHA-256 hashes, and convert SVGs to JSX — all client-side.',
      images: ['https://xeroping.online/og/dev-toolkit.png'],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool;
  const title = toolMap[tool] || 'Developer Toolkit';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Zero Ping", "item": "https://xeroping.online" },
          { "@type": "ListItem", "position": 2, "name": "Dev Toolkit", "item": "https://xeroping.online/tools/dev-toolkit" }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://xeroping.online/tools/dev-toolkit/#app",
        "name": "Zero Ping Dev Toolkit",
        "url": "https://xeroping.online/tools/dev-toolkit",
        "description": "Zero-tracking browser utilities for engineers: JWT decoder, SVG-to-JSX compiler, SHA-256/MD5/bcrypt hash generator, Base64 encoder, and cron expression parser.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Windows, macOS, Linux",
        "browserRequirements": "Requires modern browser with SubtleCrypto API",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "JWT header and payload decoder — no server logging",
          "SHA-256, MD5, and bcrypt hash generator",
          "SVG to React JSX compiler",
          "Base64 encoder and decoder",
          "Cron expression parser and human-readable translator"
        ]
      },
      {
        "@type": "HowTo",
        "name": "How to decode a JWT token without sending it to a server",
        "description": "Step-by-step guide to safely inspecting a JWT payload client-side using Zero Ping.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Open the Dev Toolkit",
            "text": "Navigate to xeroping.online/tools/dev-toolkit and select the JWT tab."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Paste your token",
            "text": "Paste the JWT string into the input field. The header, payload, and signature sections are decoded instantly in your browser using JavaScript's atob() — the token is never sent anywhere."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Inspect the claims",
            "text": "View the decoded JSON payload including iss, sub, exp, iat, and any custom claims. Expiry is rendered as a human-readable timestamp."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is it safe to paste a production JWT into Zero Ping?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Zero Ping decodes JWT tokens entirely in your browser using JavaScript — the token string is never transmitted to any server or logged. This makes it significantly safer than cloud-based JWT debuggers that process tokens server-side."
            }
          },
          {
            "@type": "Question",
            "name": "Which hash algorithms does Zero Ping support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero Ping's hash generator supports MD5, SHA-1, SHA-256, SHA-512, and bcrypt. All hashing runs locally via the Web Crypto API (SubtleCrypto) with no external dependencies for SHA variants."
            }
          },
          {
            "@type": "Question",
            "name": "Can I convert an SVG file to a React component without a build step?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Zero Ping's SVG-to-JSX converter parses SVG markup and outputs a valid React functional component in your browser. It handles attribute renaming (class to className, etc.), removes XML declarations, and optionally wraps in TypeScript types."
            }
          }
        ]
      }
    ]
  };

  let seoContent = null;

  if (tool === 'jwt') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Free Online JWT Decoder</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          JSON Web Tokens (JWT) are an open, industry-standard method for representing claims securely between two parties. Our <strong>free online JWT decoder</strong> allows developers to instantly inspect the contents of their access tokens. Easily view the signing algorithm in the header, and read the user data stored in the payload. It automatically calculates the expiration date (exp claim) to tell you if the token is still valid.
        </p>
        <h3 className="text-xl font-black uppercase text-summer-space mt-6 mb-2">Why Do Developers Need a JWT Decoder?</h3>
        <p className="font-bold text-summer-space/80">
          When building authentication systems with OAuth2 or OpenID Connect, you frequently receive Base64Url-encoded strings. To debug permission issues or verify user attributes, you must decode these tokens. Our tool does this safely within your browser, ensuring your sensitive authentication logic remains private.
        </p>
      </div>
    );
  } else if (tool === 'cron') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Free Online Cron Expression Parser</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Writing and debugging Cron schedules can be incredibly confusing. Is it minute then hour? Or hour then minute? What does <code>*/15 0 1,15 * 1-5</code> actually mean? Our <strong>free online cron expression parser</strong> solves this by translating complex cron strings into human-readable text instantly. It even provides a list of the next 5 upcoming execution dates so you can guarantee your scheduled background jobs will trigger exactly when you expect them to.
        </p>
      </div>
    );
  } else if (tool === 'svg2jsx') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">SVG to React JSX Compiler Online</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          If you are a frontend developer working with Next.js, Create React App, or Vite, you know the frustration of pasting raw SVGs into React components and getting syntax errors. Standard SVG uses kebab-case attributes, while React requires camelCase JSX properties.
        </p>
        <p className="font-bold text-summer-space/80">
          Our <strong>free online SVG to JSX converter</strong> instantly formats your icons. It transforms <code>fill-rule</code> to <code>fillRule</code>, allows you to inject Tailwind classes, wraps the SVG in a functional React component, and can automatically map hardcoded colors to <code>currentColor</code> for easy styling.
        </p>
      </div>
    );
  } else if (tool === 'hash') {
    seoContent = (
      <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">Free Crypto Hash Generator (MD5, SHA, Base64)</h2>
        <p className="font-bold text-summer-space/80 mb-6">
          Generating cryptographic hashes is a common requirement for verifying file integrity, hashing passwords, or debugging API signatures. Our <strong>free online hash generator</strong> processes your text instantly, outputting the MD5, SHA-256, and SHA-512 hashes simultaneously. It also includes a fast Base64 encoder for handling binary data transfers or basic authentication headers.
        </p>
      </div>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <DevToolkitClient activeTab={tool as Tab} />
      
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 pb-16">
        {seoContent || (
          <div className="bg-white border-[4px] border-summer-space p-8 shadow-brutal prose max-w-none">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-summer-space mb-4">The Ultimate Online Developer Toolkit</h2>
            <p className="font-bold text-summer-space/80">
              Every developer needs a reliable set of utilities for daily engineering tasks. Our free online developer toolkit combines the most essential tools into one fast, easy-to-use interface.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
