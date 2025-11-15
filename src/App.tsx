import { motion } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Features from './components/Features';
import Differentiation from './components/Differentiation';
import SocialProof from './components/Testimonials';
import EmailCapture from './components/EmailCapture';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import LegalNotices from './pages/LegalNotices';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        {/* Background elements */}
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
        
        {/* Header */}
        <Header />
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <Problem />
              <Features />
              <Differentiation />
              <SocialProof />
              <EmailCapture />
            </main>
          } />
          <Route path="/mentions-legales" element={<LegalNotices />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
          <Route path="/conditions-utilisation" element={<TermsOfService />} />
        </Routes>
        
        {/* Footer */}
        <Footer />
        
        {/* Floating elements for visual appeal */}
        <motion.div
          className="floating-orb orb-1"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="floating-orb orb-2"
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Cookie Consent */}
        <CookieConsent />
      </div>
    </ThemeProvider>
  );
}

export default App;
