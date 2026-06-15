import React from 'react';

export const metadata = {
  title: 'About Us | ZeroNode Utilities',
  description: 'About ZeroNode Utilities',
};

export default function AboutUs() {
  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16 prose max-w-none prose-invert bg-white text-summer-space">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-[4px] border-summer-space pb-4">About Us</h1>
      
      <div className="text-lg font-bold mb-6 space-y-6">
        <p>
          Welcome to ZeroNode Utilities! Our mission is to provide fast, local developer tools to help you streamline your daily workflow without compromising your privacy.
        </p>
        <p>
          In a world where almost every online tool requires you to upload your sensitive data, images, and logs to a remote server, we decided to take a different approach. Utilizing modern web technologies like WebAssembly, we built a comprehensive suite of utilities that run entirely inside your browser.
        </p>
        <p>
          This means you get the convenience of a web application with the speed and security of a desktop app. Whether you need to redact API keys from a log file, convert high-resolution RAW images, or strip GPS data from a photo, you can trust ZeroNode to handle it securely and locally.
        </p>
        <p>
          We are constantly adding new tools and improving existing ones to ensure you have the best possible experience. Thank you for choosing ZeroNode Utilities!
        </p>
      </div>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4 border-b-[2px] border-summer-space pb-2">Contact Us</h2>
      <p className="font-bold">
        Have a feature request or need support? Reach out to us at: <a href="mailto:contact@raytechinca.work" className="text-summer-tiger underline">contact@raytechinca.work</a>
      </p>
    </div>
  );
}
