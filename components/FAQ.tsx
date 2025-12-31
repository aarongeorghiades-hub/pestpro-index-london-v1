export default function FAQ() {
  const faqs = [
    {
      question: "How do I choose a pest control provider in London?",
      answer: "Look for providers that serve your specific borough, handle the pest you're dealing with, and offer the type of service you need (residential vs commercial). Check if they offer emergency callouts if the situation is urgent."
    },
    {
      question: "How much does pest control cost in London?",
      answer: "Costs vary significantly based on the pest type, severity of infestation, and property size. We recommend getting quotes from multiple providers listed in our index."
    },
    {
      question: "Can I treat the pest problem myself?",
      answer: "For minor issues, DIY solutions can be effective. Our Residential DIY Guide covers proven methods for common London pests like mice and ants. However, for established infestations or dangerous pests like wasps, professional help is recommended."
    },
    {
      question: "Are the providers in this index vetted?",
      answer: "We list verified providers operating in London. While we verify their existence and basic details, we recommend checking recent reviews and asking for certifications before hiring."
    }
  ];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
              <p className="text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
