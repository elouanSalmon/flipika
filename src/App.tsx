import { motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Features from './components/Features';
import ProductDemo from './components/ProductDemo';
import Differentiation from './components/Differentiation';
import SocialProof from './components/Testimonials';

import EmailCapture from './components/EmailCapture';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
      {/* Background elements */}
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>
      
      {/* Main content */}
      <Header />
      <main>
        <Hero />
        <Problem />
        <Features />
        <ProductDemo />
        <Differentiation />
        <SocialProof />
        <EmailCapture />
      </main>
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
      </div>
    </ThemeProvider>
  );
}

export default App;
