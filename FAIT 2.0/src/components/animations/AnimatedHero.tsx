import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
}) => {
  return (
    <section className="bg-white text-fuchsia-800 py-24 relative overflow-hidden border-b-4 border-fuchsia-200">
      {/* Hero background image */}
      <div className="absolute inset-0 z-0 opacity-10" style={{
        backgroundImage: "url('/images/hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}></div>

      {/* Animated accent elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-500 rounded-full opacity-5"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ filter: 'blur(60px)' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-300 rounded-full opacity-5"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ filter: 'blur(70px)' }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-xl opacity-90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button as={Link} to={ctaLink} size="lg">
              {ctaText}
            </Button>

            {secondaryCtaText && secondaryCtaLink && (
              <Button as={Link} to={secondaryCtaLink} variant="outline" size="lg">
                {secondaryCtaText}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Animated foreground elements */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-24 opacity-10"
        style={{
          backgroundImage: "url('/images/wave-pattern.svg')",
          backgroundSize: "cover",
        }}
        animate={{
          x: [0, -100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </section>
  );
};

export default AnimatedHero;
