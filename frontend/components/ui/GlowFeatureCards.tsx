'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ── Custom icons — inline SVGs keeping consistent 28px stroke style ──────────

function DressIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3 C10 3 8 7 5 10 L2 14 L7 15 L5 28 L25 28 L23 15 L28 14 L25 10 C22 7 20 3 20 3"/>
      <path d="M10 3 L12 8 L15 9 L18 8 L20 3"/>
      <path d="M12 3 Q15 5 18 3"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2 L16.5 11 L25 12 L16.5 13 L15 22"/>
      <path d="M15 22 L13.5 13 L5 12 L13.5 11 L15 2"/>
      <circle cx="22" cy="5"  r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="7"  cy="22" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="23" cy="22" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="7"  cy="5"  r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 27 L2 11 L8 3 L22 3 L28 11 Z"/>
      <path d="M2 11 L15 27 L28 11"/>
      <path d="M8 3 L11 11 L15 27"/>
      <path d="M22 3 L19 11 L15 27"/>
      <path d="M8 3 L11 11 L19 11 L22 3"/>
      <path d="M2 11 L11 11 M19 11 L28 11"/>
    </svg>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────

interface CardProps {
  title:       string;
  subtitle:    string;
  description: string;
  icon:        React.ReactNode;
  gradient:    string;
  href:        string;
  delay:       number;
}

function FeatureCard({ title, subtitle, description, icon, gradient, href, delay }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
      className="relative flex flex-col justify-start items-start w-full max-w-[280px] md:max-w-[300px] group mx-auto"
    >
      {/* Ambient glow */}
      <div
        className="absolute w-full h-[280px] md:h-[320px] opacity-50 rounded-[40px] pointer-events-none transition-opacity duration-500 group-hover:opacity-75"
        style={{ background: gradient, filter: 'blur(50px)' }}
      />

      {/* Card shell */}
      <Link href={href} className="relative self-stretch h-[280px] md:h-[320px] rounded-[32px] z-10 overflow-hidden block"
        style={{
          border:     '1px solid transparent',
          background: `linear-gradient(#141416, #141416) padding-box, ${gradient} border-box`,
        }}
      >
        {/* Inner shine */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[32px]"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${gradient.includes('#C5A059') ? 'rgba(197,160,89,0.07)' : 'rgba(255,255,255,0.04)'} 0%, transparent 70%)` }}
        />

        <div className="w-full h-full p-7 flex flex-col justify-between">
          {/* Top: icon + subtitle */}
          <div>
            <div className="text-white/80 mb-3 group-hover:text-white transition-colors duration-300">
              {icon}
            </div>
            <p className="text-[8px] tracking-[0.45em] uppercase text-white/30 font-light">
              {subtitle}
            </p>
          </div>

          {/* Bottom: title + desc + cta */}
          <div>
            <h3 className="font-display text-white text-xl font-light mb-2.5 leading-tight" style={{ letterSpacing: '0.02em' }}>
              {title}
            </h3>
            <p className="text-gray-400 text-[13px] leading-[1.65] font-normal mb-4">
              {description}
            </p>
            <div className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase text-white/30 group-hover:text-white/60 transition-colors duration-300">
              <span>Explore</span>
              <svg width="12" height="8" fill="none" viewBox="0 0 12 8">
                <path d="M1 4h10M7.5 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Card data ─────────────────────────────────────────────────────────────────

const CARDS: CardProps[] = [
  {
    title:       'Seven Collections',
    subtitle:    'ARA SS \'26',
    description: 'From Dark Cloud to Orange Vista — seven handcrafted stories, one summer. 41 exclusive pieces designed to be worn and remembered.',
    icon:        <DressIcon />,
    gradient:    'linear-gradient(137deg, #C5A059 0%, #F5D68A 45%, #E07B39 100%)',
    href:        '/collections',
    delay:       0.1,
  },
  {
    title:       'AI Try-On',
    subtitle:    'Virtual Fitting',
    description: 'Step into every look before you buy. Our AI-powered virtual try-on lets you see exactly how each piece drapes on you.',
    icon:        <SparkleIcon />,
    gradient:    'linear-gradient(137deg, #4F46E5 0%, #A78BFA 45%, #EC4899 100%)',
    href:        '/try-on',
    delay:       0.2,
  },
  {
    title:       'Limited Edition',
    subtitle:    'Exclusive Pieces',
    description: 'Every piece is handcrafted and made in limited quantities. When it\'s gone, it\'s gone — each run is truly one of a kind.',
    icon:        <DiamondIcon />,
    gradient:    'linear-gradient(137deg, #E11D48 0%, #FB7185 45%, #F97316 100%)',
    href:        '/shop',
    delay:       0.3,
  },
];

// ── Section ───────────────────────────────────────────────────────────────────

export default function GlowFeatureCards() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center px-6 py-16 md:p-12">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 md:mb-16"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-[#C5A059]/60 mb-3">Why ARA</p>
        <h2 className="font-display text-white text-2xl md:text-3xl font-light" style={{ letterSpacing: '0.04em' }}>
          Crafted with intention
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 w-full max-w-[960px]">
        {CARDS.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
