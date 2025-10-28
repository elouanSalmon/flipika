import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import EmailCapture from './components/EmailCapture';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Background elements */}
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>
      
      {/* Main content */}
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
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
  );
}

export default App;
