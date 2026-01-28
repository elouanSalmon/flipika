import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Features from '../components/Features';
import Differentiation from '../components/Differentiation';
import SocialProof from '../components/Testimonials';
import EmailCapture from '../components/EmailCapture';
import CookieConsent from '../components/CookieConsent';

const Landing = () => {
    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient"></div>
            <div className="bg-grid"></div>

            <main>
                <Hero />
                <Problem />
                <Features />
                <Differentiation />
                <SocialProof />
                <EmailCapture />
            </main>

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

            <CookieConsent />
        </div>
    );
};

export default Landing;
