import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-slate-900 text-white py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Find Trusted Pest Control in London
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          The independent index for London homeowners and businesses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/london/pest-control" 
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Find Pest Control
          </Link>
          <a 
            href="#diy-guide" 
            className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            DIY Guide (£3.99)
          </a>
        </div>
      </div>
    </section>
  );
}
