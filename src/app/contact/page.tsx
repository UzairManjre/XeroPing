import React from 'react';

export const metadata = {
  title: 'Contact Us | ZeroNode Utilities',
  description: 'Contact ZeroNode Utilities',
};

export default function ContactUs() {
  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16 bg-white text-summer-space min-h-[50vh]">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-[4px] border-summer-space pb-4">Contact Us</h1>
      
      <div className="p-8 border-[4px] border-summer-space bg-summer-sky shadow-brutal">
        <p className="font-bold text-xl mb-4">
          We would love to hear from you! Whether you have a question, feature request, or need support with our tools, please feel free to reach out.
        </p>
        
        <div className="mt-8">
          <p className="text-sm font-black uppercase tracking-widest text-summer-space/80 mb-2">Email Support:</p>
          <a 
            href="mailto:contact@raytechinca.work" 
            className="inline-block bg-summer-space text-white px-8 py-4 font-black uppercase text-xl border-[4px] border-summer-space hover:bg-summer-tiger hover:text-summer-space transition-all shadow-[6px_6px_0px_#023047] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            contact@raytechinca.work
          </a>
        </div>
      </div>
    </div>
  );
}
