import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Zero Ping Utilities',
  description: 'Privacy Policy for Zero Ping Utilities',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16 prose max-w-none prose-invert bg-white text-summer-space">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-[4px] border-summer-space pb-4">Privacy Policy</h1>
      
      <p className="font-bold text-lg mb-6">Last Updated: June 2026</p>

      <p className="font-bold text-lg mb-6">
        At Zero Ping Utilities, we take your privacy extremely seriously. <strong>All file processing is done locally in the browser. No files are uploaded, stored, or transmitted to our servers.</strong>
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">1. Local Processing</h2>
      <p className="mb-6 font-bold">
        Our suite of developer tools and utilities uses modern web technologies (like WebAssembly and client-side JavaScript) to perform all processing on your device. Whether you are stripping EXIF data, converting images, or compiling code, your sensitive files and data never leave your computer.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">2. Information Collection</h2>
      <p className="mb-6 font-bold">
        We do not collect, store, or process any personal data, files, or information that you input into our tools. 
        We may use standard web analytics and diagnostic tools to monitor the health and performance of our website, which may collect anonymous usage metrics such as browser type, operating system, and pages visited.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">3. Cookies and Advertising</h2>
      <p className="mb-6 font-bold">
        We use third-party advertising companies to serve ads when you visit our website. These companies may use aggregated information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">4. Changes to This Privacy Policy</h2>
      <p className="mb-6 font-bold">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">5. Contact Us</h2>
      <p className="mb-6 font-bold">
        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:contact@raytechinca.work" className="text-summer-tiger underline">contact@raytechinca.work</a>.
      </p>
    </div>
  );
}
