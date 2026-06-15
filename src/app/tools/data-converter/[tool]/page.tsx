import React from 'react';

export const metadata = {
  title: 'Terms of Service | Zero Ping Utilities',
  description: 'Terms of Service for Zero Ping Utilities',
};

export default function TermsOfService() {
  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16 prose max-w-none prose-invert bg-white text-summer-space">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-[4px] border-summer-space pb-4">Terms of Service</h1>
      
      <p className="font-bold text-lg mb-6">Last Updated: June 2026</p>

      <p className="font-bold text-lg mb-6">
        Please read these Terms of Service completely using Zero Ping Utilities. This Agreement documents the legally binding terms and conditions attached to the use of the Site at Zero Ping.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">1. Intellectual Property</h2>
      <p className="mb-6 font-bold">
        The Site and all of its original content are the sole property of Zero Ping and are, as such, fully protected by the appropriate international copyright and other intellectual property rights laws.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">2. Acceptable Use</h2>
      <p className="mb-6 font-bold">
        Our tools are provided for free for both personal and commercial use. However, you agree not to use the tools to process malicious, illegal, or harmful materials. While processing happens locally, we strictly prohibit the automated scraping of our tools or attempting to circumvent our services.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">3. Disclaimer of Warranties</h2>
      <p className="mb-6 font-bold">
        Our services are provided on an "as-is" and "as available" basis. We do not provide warranties of any kind, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">4. Limitation of Liability</h2>
      <p className="mb-6 font-bold">
        In no event shall Zero Ping, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for damages, direct or indirect, arising out of or in connection with your use of the Service.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">5. Governing Law</h2>
      <p className="mb-6 font-bold">
        This Agreement is governed in accordance with the laws, without regard to its conflict of law provisions.
      </p>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">6. Contact Us</h2>
      <p className="mb-6 font-bold">
        If you have any questions about this Agreement, please feel free to contact us at: <a href="mailto:contact@raytechinca.work" className="text-summer-tiger underline">contact@raytechinca.work</a>.
      </p>
    </div>
  );
}
