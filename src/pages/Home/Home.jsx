import React from 'react';
import HomeNavbar from './components/HomeNavbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import PlatformPreview from './components/PlatformPreview';
import KnowledgeGraphVisual from './components/KnowledgeGraphVisual';
import AIAssistantSection from './components/AIAssistantSection';
import EnterpriseSecurity from './components/EnterpriseSecurity';
import CTASection from './components/CTASection';
import HomeFooter from './components/HomeFooter';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <HomeNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PlatformPreview />
      <KnowledgeGraphVisual />
      <AIAssistantSection />
      <EnterpriseSecurity />
      <CTASection />
      <HomeFooter />
    </div>
  );
};

export default Home;
