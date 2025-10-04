import React from 'react';

const ProcessSection = () => {
  const steps = [
    {
      title: "Post a job",
      description: "Tell us what you need. Provide as many details as possible, but don't worry about getting it perfect."
    },
    {
      title: "Talent comes to you",
      description: "Get qualified proposals within 24 hours, and meet the candidates you're excited about. Hire as soon as you're ready."
    },
    {
      title: "Collaborate easily",
      description: "Use Upwork to chat or video call, share files, and track project progress right from the app."
    },
    {
      title: "paymentt simplified",
      description: "Receive invoices and make paymentts through Upwork. Only pay for work you authorize."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          How to hire on Upwork
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-xl">{index + 1}</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Trusted by</p>
          <div className="flex justify-center items-center space-x-8 mb-12">
            <span className="text-gray-700 font-semibold">Microsoft</span>
            <span className="text-gray-700 font-bold">AUTOMATIC</span>
            <span className="text-gray-700">eUser</span>
            <span className="text-gray-700 font-bold">C O T Y</span>
          </div>

          <blockquote className="max-w-2xl mx-auto">
            <p className="text-gray-600 italic text-lg">
              "One of the greatest advantages of utilizing freelancers is finding a great variety of talent with different skills and bringing on new talent quickly as our needs change."
            </p>
            <footer className="mt-4 font-semibold">Carol Taylor</footer>
            <p className="text-gray-600">Director of Content Experience, Microsoft</p>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;