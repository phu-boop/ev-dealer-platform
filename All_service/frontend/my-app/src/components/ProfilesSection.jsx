import React from 'react';

const ProfilesSection = () => {
  const profiles = [
    {
      name: "Deborah M.",
      title: "Recruiter | Researcher | Writer | Educator",
      rating: "4.6/5",
      jobs: "31 jobs",
      skills: ["Recruiting", "Administrative Support", "Writing"],
      link: "See more profiles"
    },
    {
      name: "Luka I.",
      title: "Top YouTube Thumbnail Designer",
      rating: "5.0/5",
      jobs: "177 jobs",
      skills: ["YouTube Development", "Branding", "YouTube Marketing"],
      link: "See more"
    },
    {
      name: "Alia B.",
      title: "Executive | Administrative | Operations | Systems | Project Management",
      rating: "5.0/5",
      jobs: "14 jobs",
      skills: ["Healthcare", "Startup Company", "Business Development"],
      link: "See more"
    },
    {
      name: "Allie P.",
      title: "Copyeditor | proofreader | copywriter",
      rating: "5.0/5",
      jobs: "9 jobs",
      skills: ["Book Editing", "Data Entry", "Microsoft Word"],
      link: "See more"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Work with anyone. Anywhere.
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg">{profile.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{profile.title}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500">★★★★★</span>
                <span className="ml-2 text-gray-700">
                  {profile.rating} ({profile.jobs})
                </span>
              </div>
              <div className="mt-4">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-2"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <a href="#" className="text-blue-600 font-semibold text-sm mt-4 block">
                {profile.link}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfilesSection;