import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import ProfilesSection from '../components/ProfilesSection';
import ProcessSection from '../components/ProcessSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
      <main className="flex-grow">
        <HeroSection />
        <CategoriesSection />
        <ProfilesSection />
        <ProcessSection />
      </main>
  );
};

export default Home;