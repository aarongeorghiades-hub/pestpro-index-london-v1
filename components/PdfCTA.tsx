import { FileText } from 'lucide-react';

export default function PdfCTA({ id = "diy-guide", secondary = false }: { id?: string, secondary?: boolean }) {
  return (
    <section id={id} className={`py-12 px-4 ${secondary ? 'bg-slate-100' : 'bg-white'}`}>
      <div className="container mx-auto max-w-4xl bg-blue-50 border border-blue-100 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-blue-100 p-4 rounded-full">
          <FileText className="w-12 h-12 text-blue-600" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            PestPro Index Residential DIY Guide
          </h2>
          <p className="text-slate-600 mb-4">
            Save money and stress. Learn what works (and what doesn't) before calling a pro. 
            Comprehensive PDF guide for London homes.
          </p>
          <div className="text-sm text-slate-500 mb-4">
            Covers: Mice, Rats, Ants, Moths, Bed Bugs & more.
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg whitespace-nowrap transition-colors">
          Buy Guide (£3.99)
        </button>
      </div>
    </section>
  );
}
