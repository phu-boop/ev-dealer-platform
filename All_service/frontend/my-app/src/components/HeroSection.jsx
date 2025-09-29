import React from 'react';
import  Button  from './ui/Button';

const HeroSection = () => {
  return (
    <section className="bg-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hire 3x faster. 12+ million top-rated freelancers
          </h1>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Job postings</h3>
              <p className="text-gray-600">
                Post jobs to 12+ million freelancers. Receive proposals & bids in minutes.
                See reviews, work history, and more.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Managing contracts</h3>
              <p className="text-gray-600">
                Automate time tracking & invoicing. Track project progress.
                Review work, make payments & create reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Free access</h3>
              <p className="text-gray-600">
                Post jobs, view proposals, and get pricing for free - no credit card required.
                Only pay when you make a hire.
              </p>
            </div>
          </div>

          <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg">
            Get started
          </Button>

          <div className="mt-12">
            <p className="text-gray-600 mb-4">Trusted by</p>
            <div className="flex justify-center items-center space-x-8">
              <span className="text-gray-700 font-semibold">Microsoft</span>
              <span className="text-gray-700">@drbnb</span>
              <span className="text-gray-700 font-bold">AUTOMATIC</span>
              <span className="text-gray-700 font-bold">COTY</span>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-gray-600">
              Clients rate talent <span className="text-yellow-500">★★★★★</span>
              <span className="font-semibold"> 4.9/5</span> based on 2.9M+ reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;