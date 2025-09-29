import React from 'react';

const CategoriesSection = () => {
  const categories = [
    {
      title: "Development & IT",
      rating: "4.9",
      contracts: "1.5M contracts",
      rate: "$50/hr"
    },
    {
      title: "Design & Creative",
      rating: "4.9",
      contracts: "1.5M contracts",
      rate: "$50/hr"
    },
    {
      title: "Sales & Marketing",
      rating: "4.7",
      contracts: "1.5M contracts",
      rate: "$50/hr"
    },
    {
      title: "Writing & Translation",
      rating: "4.92",
      contracts: "1.5M contracts",
      rate: "$50/hr"
    },
    {
      title: "Admin & Support",
      rating: "4.8",
      contracts: "1.5M contracts",
      rate: "$50/hr"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Hire for anything, from quick to longer jobs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          {categories.map((category, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
              <div className="flex justify-center items-center mb-2">
                <span className="text-yellow-500">★★★★★</span>
                <span className="ml-2 text-gray-700">{category.rating}</span>
              </div>
              <p className="text-gray-600 mb-4">{category.contracts}</p>
              <p className="text-gray-800 font-semibold">{category.rate}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold">Work with anyone. Anywhere.</h3>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;