import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner class names
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Reusable scroll reveal component
const Reveal = ({ children, className, delay = 0, y = 50 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Header = ({ heroRef, featuredWorkRef, legacyRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredNav, setHoveredNav] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background when scrolled past top
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Check if hero, featured work, or legacy sections are fully in view
      const checkSectionInView = (ref) => {
        if (!ref || !ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        // Hide navbar only when section is fully visible in viewport
        return rect.top <= 0 && rect.bottom >= window.innerHeight;
      };

      const heroInView = checkSectionInView(heroRef);
      const featuredInView = checkSectionInView(featuredWorkRef);
      const legacyInView = checkSectionInView(legacyRef);

      setIsHidden(heroInView || featuredInView || legacyInView);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [heroRef, featuredWorkRef, legacyRef]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-white w-full pt-2 px-2 md:pt-3 md:px-3">
        <div className="w-full bg-[#A3F1D1] text-[#111212] text-center py-1.5 md:py-2 text-[10px] md:text-xs font-bold tracking-wider relative z-[51] rounded-xl md:rounded-[1rem]">
          🚨 The Category Leaderboard - Live Now
        </div>
      </div>

      <AnimatePresence>
        {hoveredNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] bg-black/10 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      <motion.header
        className={cn(
          "fixed w-[95%] left-1/2 -translate-x-1/2 z-50 px-6 md:px-12 flex justify-between items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full",
          isScrolled ? "bg-white/30 backdrop-blur-md border border-white/40 py-4 top-4" : "bg-white/20 backdrop-blur-sm border border-white/30 py-6 top-6"
        )}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: isHidden ? 0 : 1, scale: isHidden ? 0.95 : 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        pointerEvents={isHidden ? "none" : "auto"}
      >
        {/* Logo Text */}
        <div className="text-2xl font-semibold tracking-tighter text-[#1a1a1a] cursor-pointer flex items-center gap-1">
          Rise at Seven<span className="text-lg">↘</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center space-x-2 text-[13px] font-bold tracking-wide text-[#1a1a1a]">
          {['Services +', 'Industries +', 'International +', 'About +'].map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => setHoveredNav(item)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <a
                href="#"
                className={cn(
                  "transition-all duration-300 px-4 py-2 rounded-full block",
                  hoveredNav === item ? "bg-[#1a1a1a] text-white" : "text-[#1a1a1a] hover:text-gray-600"
                )}
              >
                {item}
              </a>

              <AnimatePresence>
                {hoveredNav === item && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-[1.5rem] p-2 w-[350px] shadow-2xl z-[60] flex"
                  >
                    <div className="w-1/2 p-4 flex items-center justify-center text-center">
                      <h3 className="text-xl font-bold tracking-tight text-[#111212] leading-tight">
                        {item === 'Services +' ? 'B2B Marketing' :
                          item === 'Industries +' ? 'Retail & eCommerce' :
                            item === 'International +' ? 'Global Reach' : 'Our Story'}
                      </h3>
                    </div>
                    <div className="w-1/2 rounded-xl overflow-hidden bg-gray-100 aspect-square relative">
                      <img src={`https://picsum.photos/400/400?random=${item.length * 5}`} alt={item} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <a href="#" className="hover:text-gray-600 transition-colors relative flex items-center px-4 text-[#1a1a1a]">
            Work
            <span className="absolute top-0 right-0 bg-[#A3F1D1] text-black text-[10px] w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">25</span>
          </a>
          <a href="#" className="hover:text-gray-600 transition-colors px-2 text-[#1a1a1a]">Careers</a>
          <a href="#" className="hover:text-gray-600 transition-colors px-2 text-[#1a1a1a]">Blog</a>
          <a href="#" className="hover:text-gray-600 transition-colors px-2 text-[#1a1a1a]">Webinar</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-6 relative z-[65]">
          <button className="hidden md:flex items-center gap-1.5 bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full text-[13px] font-bold tracking-tight hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            Get In Touch <span>↗</span>
          </button>

          {/* Hamburger */}
          <button
            className="xl:hidden w-10 h-10 flex flex-col justify-center items-center space-y-1.5 relative z-[65]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="w-8 h-[2px] bg-[#1a1a1a] origin-center transition-transform"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -0 } : { rotate: 0, y: 0 }}
              className="w-8 h-[2px] bg-[#1a1a1a] origin-center transition-transform"
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-[#111212] p-6 pt-32 flex flex-col"
          >
            <div className="flex flex-col space-y-8 text-4xl font-bold uppercase tracking-tighter">
              {['Services', 'Work', 'About', 'Culture', 'Careers', 'Blog'].map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="hover:text-gray-400 transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = React.forwardRef((props, ref) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section ref={ref} className="bg-white w-full px-2 pt-2 pb-0 md:px-3 md:pt-3 md:pb-0">
      <div className="relative min-h-[calc(100vh-3rem)] rounded-3xl md:rounded-[2.5rem] overflow-hidden flex flex-col justify-center items-center w-full pt-20 pb-12">
        {/* Background Image (Video Placeholder) */}
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
          <img
            src="https://picsum.photos/1920/1080?random=20"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#111212]"></div>
        </div>

        <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col items-center w-full max-w-7xl px-6 text-center mt-auto mb-auto">
          {/* Top small text and awards */}
          <div className="flex flex-col items-center mb-6 space-y-4">
            <p className="text-white text-[11px] md:text-sm font-bold tracking-[0.2em] uppercase leading-tight">
              #1 Most Recommended<br />Content Marketing Agency
            </p>
            <div className="flex items-center space-x-2 md:space-x-4 opacity-80">
              {/* Using text blocks as placeholders for the award logos */}
              <span className="text-white text-[10px] md:text-xs border border-white/30 px-2 py-1 rounded">AWARDS</span>
              <span className="text-white text-[10px] md:text-xs border border-white/30 px-2 py-1 rounded">THE DRUM</span>
              <span className="text-white text-[10px] md:text-xs border border-white/30 px-2 py-1 rounded">GLOBAL SEARCH</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-[9.5rem] font-bold tracking-tighter leading-[0.95] text-white flex flex-col items-center justify-center w-full">
            <span>We Create</span>
            <span className="flex items-center flex-wrap justify-center gap-2 md:gap-4 lg:gap-6 mt-1 lg:mt-3">
              Category
              <img
                src="https://picsum.photos/160/160?random=21"
                alt="Leader"
                className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-3xl object-cover"
              />
              Leaders
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-3xl font-medium tracking-tight text-white mt-6 lg:mt-10 mb-8">
            on every searchable platform
          </p>
        </motion.div>

        {/* Platforms Logos */}
        <motion.div style={{ opacity }} className="relative z-10 flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-90 mt-auto pt-10">
          {['Google', 'ChatGPT', 'Gemini', 'TikTok', 'YouTube', 'Pinterest', 'GIPHY', 'reddit', 'amazon'].map((platform) => (
            <span key={platform} className="text-white text-sm md:text-lg font-bold tracking-tight">
              {platform}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

const DemandAndDiscovery = () => {
  const logos = ['CapitalOne', 'Red Bull', 'JD', 'Kroger', 'HubSpot', 'XBOX', 'CapitalOne', 'Red Bull', 'JD', 'Kroger', 'HubSpot', 'XBOX'];

  return (
    <section className="bg-[#EFEEEC] text-[#111212] pt-12 pb-24 md:pb-32 overflow-hidden rounded-t-[2.5rem] md:rounded-t-[4rem] relative z-20">
      {/* Scrolling Marquee */}
      <div className="w-full flex overflow-hidden border-b border-gray-300 pb-12 mb-16 md:mb-24">
        <motion.div
          className="flex space-x-16 md:space-x-32 items-center whitespace-nowrap px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {logos.map((logo, i) => (
            <span key={i} className="text-2xl md:text-3xl font-bold tracking-tighter opacity-70">
              {logo}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <Reveal>
              <div className="text-sm font-bold tracking-wide flex items-center gap-4 mb-24">
                <span>The agency behind ...</span>
                <span className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-lg">+</span>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-xl md:text-3xl font-semibold tracking-tight leading-snug max-w-lg">
                A global team of search-first content marketers engineering semantic relevancy & category signals for both the internet and people
              </p>
            </Reveal>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            <Reveal delay={0.3}>
              <h2 className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-black tracking-tighter leading-[0.9] mb-12">
                Driving Demand &<br />
                Discovery
                <img
                  src="https://picsum.photos/80/80?random=30"
                  alt="Discovery icon"
                  className="inline-block w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover align-baseline ml-4 border border-gray-300"
                />
              </h2>
            </Reveal>

            <Reveal delay={0.4} className="flex gap-4">
              <button className="bg-white px-6 py-3 rounded-full text-[13px] font-bold tracking-wide border border-gray-200 hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm flex items-center gap-2">
                Our Story <span>↗</span>
              </button>
              <button className="bg-transparent px-6 py-3 rounded-full text-[13px] font-bold tracking-wide border border-gray-300 hover:bg-white hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-2">
                Our Services <span>↗</span>
              </button>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

const WorkTitle = ({ work, i, total, scrollYProgress }) => {
  const isLastTwo = work.client === 'Leading E Sim brand globally';
  const firstPart = isLastTwo ? 'Leading E Sim' : work.client;
  const secondPart = isLastTwo ? 'brand globally' : '';

  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, (i - 1.5) / total), i / total, Math.min(1, (i + 1.5) / total)],
    [0.1, 1, 0.1]
  );

  const scale = useTransform(
    scrollYProgress,
    [Math.max(0, (i - 1) / total), i / total, Math.min(1, (i + 1) / total)],
    [0.9, 1, 0.9]
  );

  return (
    <motion.div
      style={{ opacity, scale }}
      className="flex flex-col"
    >
      <div className="flex items-start">
        <h3 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-bold tracking-tighter leading-[0.9] text-[#EFEEEC]">
          {firstPart}
        </h3>
        {work.year && (
          <span className="font-mono text-[9px] md:text-[11px] text-[#EFEEEC] ml-2 mt-4 opacity-40">
            {work.year}
          </span>
        )}
      </div>
      {secondPart && (
        <h3 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-bold tracking-tighter leading-[0.9] text-gray-600">
          {secondPart}
        </h3>
      )}
    </motion.div>
  );
};

const FeaturedWork = React.forwardRef((props, ref) => {
  const works = [
    { client: 'SIXT', year: '[2023-2025]', img: 'https://picsum.photos/1000/1200?random=40', tag: 'Car rental' },
    { client: 'Dojo - B2B', year: '[2021-2025]', img: 'https://picsum.photos/1000/1200?random=41', tag: 'Fintech' },
    { client: 'Magnet Trade - B2B', year: '[2023-2024]', img: 'https://picsum.photos/1000/1200?random=42', tag: 'B2B Trade' },
    { client: 'Leading E Sim brand globally', year: '[2023-2025]', img: 'https://picsum.photos/1000/1200?random=43', tag: 'Tech' },
    { client: 'JD Sports', year: '[2025]', img: 'https://picsum.photos/1000/1200?random=44', tag: 'Retail' },
    { client: 'Parkdean Resorts', year: '[2019-2025]', img: 'https://picsum.photos/1000/1200?random=45', tag: 'Travel' }
  ];

  const containerRef = useRef(null);

  // Merge both refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(containerRef.current);
      } else {
        ref.current = containerRef.current;
      }
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Sync active index with scroll progress
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const index = Math.min(
        works.length - 1,
        Math.floor(latest * works.length)
      );
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    });
  }, [activeIndex, works.length, scrollYProgress]);

  const mouseX = useSpring(0, { stiffness: 500, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 30 });
  const [isHovering, setIsHovering] = useState(null);

  const handleMouseMove = (e, i) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const yRight = useTransform(scrollYProgress, [0, 1], ["0%", `-${(works.length - 1) * 100 / works.length}%`]);
  const yLeft = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section ref={containerRef} className="bg-white w-full h-[400vh] relative z-20">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="bg-[#111212] w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
          
          {/* Left Side - Information (Smooth Scrolling Titles) */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 lg:px-20 relative z-20 bg-[#111212]">
            <div className="absolute top-12 md:top-20 left-8 md:left-16 lg:left-20">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#EFEEEC] opacity-60">Featured Work</h2>
            </div>
            
            <div className="relative h-[60vh] flex flex-col justify-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#111212] to-transparent z-30" />
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#111212] to-transparent z-30" />
              
              <motion.div 
                style={{ y: yLeft }}
                className="flex flex-col space-y-4"
              >
                {works.map((work, i) => (
                  <WorkTitle 
                    key={i} 
                    work={work} 
                    i={i} 
                    total={works.length} 
                    scrollYProgress={scrollYProgress} 
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right Side - Animated Scrolling Column */}
          <div className="w-full md:w-1/2 h-full relative overflow-hidden px-4 md:px-8">
            <motion.div 
              style={{ y: yRight }}
              className="flex flex-col gap-8 py-[25vh]"
            >
              {works.map((work, i) => (
                <div key={i} className="featured-work-image w-full flex-shrink-0">
                  <div 
                    className="relative w-full aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-900 shadow-xl group cursor-none"
                    onMouseEnter={() => setIsHovering(i)}
                    onMouseLeave={() => setIsHovering(null)}
                    onMouseMove={(e) => handleMouseMove(e, i)}
                  >
                    {/* Main Image */}
                    <img 
                      src={work.img} 
                      alt={work.client} 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col justify-between p-8 md:p-12 z-10",
                      i % 2 === 0 ? "bg-[#fbd2d7]" : "bg-[#bde6ff]"
                    )}>
                      {/* Top text on hover */}
                      <div className="transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        <h4 className="text-black text-2xl md:text-4xl font-bold leading-tight tracking-tight max-w-[80%]">
                          {i === 0 ? "Building the UK's leading beauty dupe brand" : 
                           i === 1 ? "Revolutionizing the way the world pays" : 
                           i === 2 ? "Driving demand in the B2B trade sector" :
                           i === 3 ? "Scaling global reach for tech pioneers" :
                           i === 4 ? "Redefining retail excellence at scale" : 
                           "Crafting unforgettable travel experiences"}
                        </h4>
                      </div>

                      {/* Custom Follower Cursor */}
                      <motion.div 
                        className="pointer-events-none absolute z-50 flex items-center justify-center"
                        style={{
                          left: mouseX,
                          top: mouseY,
                          translateX: "-50%",
                          translateY: "-50%"
                        }}
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#A3F1D1] flex items-center justify-center text-black shadow-2xl">
                          <span className="text-2xl md:text-3xl font-bold">↗</span>
                        </div>
                      </motion.div>

                      {/* Bottom row on hover */}
                      <div className="flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                        <div className="text-black font-black uppercase tracking-tighter text-xs md:text-sm">
                          {work.client}
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                          <span className="text-gray-400 text-sm">⚲</span>
                          <span className="text-[11px] md:text-xs font-bold text-black uppercase tracking-wider">{work.tag}</span>
                          <span className="text-gray-400 text-xs">↗</span>
                        </div>
                      </div>
                    </div>

                    {/* Default Tag */}
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 group-hover:opacity-0 transition-opacity duration-300">
                      <button className="bg-[#111212]/60 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-[12px] font-bold tracking-wide border border-white/20 flex items-center gap-2 hover:bg-white hover:text-black transition-colors duration-300">
                        <span className="text-lg leading-none mt-[-2px]">⚲</span> {work.tag} <span className="ml-1">↘</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

const ServiceItem = ({ title, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Using title length and characters to ensure consistent "random" images per service
  const randomId = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomImg = `https://picsum.photos/1000/300?random=${randomId}`;

  return (
    <Reveal delay={delay}>
      <div 
        className="relative py-4 md:py-6 border-b border-gray-300 group cursor-pointer transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Default Text (Visible when NOT hovered) */}
        <div className={cn(
          "text-3xl md:text-4xl lg:text-[3.2rem] font-bold tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isHovered ? "opacity-0 translate-x-10" : "opacity-100 translate-x-0"
        )}>
          {title}
        </div>

        {/* Hover Pill Shape (Visible only on HOVER) */}
        <div className={cn(
          "absolute inset-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center px-4 md:px-8",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
        )}>
          {/* Background Container with Image */}
          <div className="absolute inset-y-1.5 md:inset-y-2 left-0 right-0 rounded-full overflow-hidden shadow-lg transform scale-y-[0.9] group-hover:scale-y-100 transition-transform duration-500">
             <img src={randomImg} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
          
          {/* Arrow and Text */}
          <div className="relative z-20 flex items-center gap-6 text-white ml-2">
            <span className="text-4xl md:text-5xl lg:text-[4rem] font-light leading-none transform group-hover:rotate-0 -rotate-12 transition-transform duration-500">↗</span>
            <span className="text-3xl md:text-4xl lg:text-[3.2rem] font-bold tracking-tighter">{title}</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

const ServicesAndBanner = () => {
  return (
    <section className="bg-[#EFEEEC] text-[#111212] pt-24 pb-32 relative z-30 rounded-t-[2.5rem] md:rounded-t-[4rem]">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <Reveal>
            <h2 className="text-6xl md:text-[5.5rem] lg:text-[7.5rem] font-bold tracking-tighter leading-none flex items-center gap-4">
              Our 
              <img src="https://picsum.photos/120/120?random=50" className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-3xl object-cover -mt-2" alt="Services" />
              Services
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 md:mt-0">
            <button className="bg-white px-6 py-3 rounded-full text-[13px] font-bold tracking-wide border border-gray-200 hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm flex items-center gap-2">
              View All Services <span>↗</span>
            </button>
          </Reveal>
        </div>

        <div className="border-t border-gray-300 pt-8 pb-12 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <div className="flex flex-col">
              <ServiceItem title="Digital PR" delay={0.1} />
              <ServiceItem title="Search & Growth Strategy" delay={0.2} />
              <ServiceItem title="Data & Insights" delay={0.3} />
            </div>
            <div className="flex flex-col">
              <ServiceItem title="Organic Social & Content" delay={0.15} />
              <ServiceItem title="Content Experience" delay={0.25} />
              <ServiceItem title="Onsite SEO" delay={0.35} />
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="w-full overflow-hidden flex pt-8 md:pt-12">
        <motion.div
          className="flex whitespace-nowrap items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {/* We repeat the phrase to ensure seamless scrolling */}
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <h2 className="text-[7rem] md:text-[12rem] lg:text-[15rem] font-bold tracking-tighter leading-none pr-8 flex items-center gap-4 md:gap-8">
                Chasing Consumers Not Algorithms
                <img src="https://picsum.photos/240/240?random=51" className="w-20 h-20 md:w-32 md:h-32 lg:w-48 lg:h-48 rounded-3xl object-cover border border-gray-300" alt="Banner image" />
              </h2>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const LegacyInTheMaking = React.forwardRef((props, ref) => {
  const containerRef = useRef(null);

  // Merge both refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(containerRef.current);
      } else {
        ref.current = containerRef.current;
      }
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const legacyCards = [
    {
      id: 'pioneers',
      title: 'Pioneers',
      text1: "We're dedicated to creating the industry narrative that others follow 3 years from now. We paved the path for creative SEO, multi-channel search with Digital PR, and Social Search and we will continue to do it.",
      text2: "We're on a mission to be the first search-first agency to win a Cannes Lion disrupting the status quo.",
      img: 'https://picsum.photos/400/400?random=80',
      bgColor: 'bg-black text-[#EFEEEC]',
      rotate: -3,
      index: 0
    },
    {
      id: 'award-winning',
      title: 'Award Winning',
      text1: "A roll top bath full of 79 awards. Voted The Drum's best agency outside of London. We are official judges for industry awards including Global Search Awards and Global Content Marketing Awards.",
      img: 'https://picsum.photos/400/400?random=81',
      bgColor: 'bg-[#A7F3D0] text-[#111212]',
      rotate: 4,
      index: 1
    },
    {
      id: 'speed',
      title: 'Speed',
      text1: "People ask us why we are called Rise at Seven? Ever heard the saying Early Bird catches the worm? Google is moving fast, but humans are moving faster. We chase consumers, not algorithms. We've created a service which takes ideas to result within 60 minutes.",
      img: 'https://picsum.photos/400/400?random=82',
      bgColor: 'bg-white text-[#111212]',
      rotate: -2,
      index: 2
    }
  ];

  const y0 = useTransform(scrollYProgress, [0, 0.33], ["0vh", "-150vh"]);
  const y1 = useTransform(scrollYProgress, [0.33, 0.66], ["0vh", "-150vh"]);

  const transforms = [y0, y1, null];

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#EFEEEC] w-full z-10 pb-32">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <h2 className="absolute top-16 md:top-24 text-xl md:text-2xl font-bold tracking-tight text-center z-50 text-[#111212]">
          Legacy In The Making
        </h2>

        <div className="relative w-[90%] md:w-full max-w-[550px] aspect-[4/5] md:aspect-square flex justify-center items-center mt-10">
          {[...legacyCards].reverse().map((card, idx) => {
            const realIndex = 2 - idx;
            const y = transforms[realIndex];

            return (
              <motion.div
                key={card.id}
                style={{ y: y || 0, rotate: card.rotate }}
                className={`absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl ${card.bgColor}`}
              >
                <img src={card.img} alt={card.title} className="w-28 h-28 md:w-44 md:h-44 rounded-2xl md:rounded-[2rem] object-cover mb-6 md:mb-10" />
                <h3 className="text-4xl md:text-[4.5rem] font-bold tracking-tighter mb-4 md:mb-6 leading-none">{card.title}</h3>
                <p className="text-center text-[13px] md:text-[15px] leading-[1.6] font-medium mb-3 max-w-[340px]">
                  {card.text1}
                </p>
                  {card.text2 && (
                  <p className="text-center text-[13px] md:text-[15px] leading-[1.6] font-medium max-w-[340px]">
                    {card.text2}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

const NewsCard = ({ post, i }) => {
  const mouseX = useSpring(0, { stiffness: 500, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 30 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <Reveal delay={0.1 * (i + 1)}>
      <div 
        className="flex flex-col group cursor-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="relative w-full aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gray-100 mb-8">
          <img
            src={post.img}
            alt={post.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isHovered ? "blur-2xl scale-110 opacity-80" : "blur-0 scale-100 opacity-100"
            )}
          />

          <motion.div 
            className="pointer-events-none absolute z-50 flex items-center justify-center"
            style={{
              left: mouseX,
              top: mouseY,
              translateX: "-50%",
              translateY: "-50%",
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.5
            }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#A3F1D1] flex items-center justify-center text-black shadow-2xl">
              <span className="text-2xl md:text-3xl font-bold">↗</span>
            </div>
          </motion.div>

          <div className="absolute top-6 left-6 z-20">
            <span className="bg-[#111212]/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border border-white/20">
              {post.category}
            </span>
          </div>

          {i === 1 && (
            <div className="absolute bottom-8 right-8 w-8 h-8 flex items-center justify-center text-white text-xl opacity-80 z-20">
              ↘
            </div>
          )}
        </div>

        <div className="px-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
              <img src={post.avatar} className="w-5 h-5 rounded-full border border-white" alt={post.author} />
              <span className="text-[11px] font-bold text-gray-600">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-gray-500">
              <span className="text-[11px]">⏱</span>
              <span className="text-[11px] font-bold">{post.time}</span>
            </div>
          </div>
          <h3 className="text-2xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-tight group-hover:text-gray-600 transition-colors duration-300">
            {post.title}
          </h3>
        </div>
      </div>
    </Reveal>
  );
};

const WhatsNew = () => {
  const posts = [
    {
      category: "News",
      title: "Ryan McNamara Is Now Rise at Seven's Global Operations Director",
      author: "Carrie Rose",
      time: "2 mins",
      img: "https://picsum.photos/800/800?random=100",
      avatar: "https://i.pravatar.cc/100?u=carrie"
    },
    {
      category: "Food/Hospitality/Drink",
      title: "Rise at Seven Exits Sheffield and Triples Manchester as new HQ as they go for global expansion",
      author: "Ray Saddiq",
      time: "2 mins",
      img: "https://picsum.photos/800/800?random=101",
      avatar: "https://i.pravatar.cc/100?u=ray"
    },
    {
      category: "Food/Hospitality/Drink",
      title: "Rise at Seven Appointed by Langtins to drive demand and retail growth for Noomz",
      author: "Carrie Rose",
      time: "2 mins",
      img: "https://picsum.photos/800/800?random=102",
      avatar: "https://i.pravatar.cc/100?u=carrie2"
    }
  ];

  return (
    <section className="bg-white text-[#111212] py-24 md:py-32 px-6 md:px-12 w-full overflow-hidden">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
          <Reveal>
            <h2 className="text-7xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter flex items-center gap-4">
              What's
              <div className="w-16 h-12 md:w-24 md:h-16 lg:w-32 lg:h-20 bg-gray-900 rounded-2xl overflow-hidden mt-2 relative">
                <img src="https://picsum.photos/200/150?random=103" alt="New" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                </div>
              </div>
              New
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 md:mt-0">
            <button className="bg-white px-8 py-4 rounded-full text-[13px] font-bold tracking-wide border border-gray-200 hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm flex items-center gap-2">
              Explore More Thoughts <span className="text-lg">↗</span>
            </button>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {posts.map((post, i) => (
            <NewsCard key={i} post={post} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#EFEEEC] px-2 pb-2 md:px-3 md:pb-3">
      <div className="bg-[#111212] text-white rounded-[2.5rem] md:rounded-[3.5rem] pt-12 pb-6 px-6 md:px-10 overflow-hidden">
        <div className="w-full">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12 lg:mb-16">
            {/* Left: Newsletter */}
            <div className="lg:w-[30%]">
              <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-tight">Stay updated with Rise news</h2>
              <div className="relative group max-w-sm">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  className="w-full bg-[#222] border-none rounded-full py-4 px-6 text-sm focus:ring-1 focus:ring-[#A3F1D1] transition-all outline-none text-white placeholder-gray-500"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#A3F1D1] text-black w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                  <span className="text-base">↗</span>
                </button>
              </div>

              {/* Social Icons */}
              <div className="flex gap-2 mt-6">
                {['f', '𝕏', 'in', 'yt', 'tt', 'ig'].map((icon, i) => (
                  <a key={i} href="#" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/5">
                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                      {icon === 'yt' ? <span className="text-[7px]">▶</span> : icon}
                      <span className="text-[5px] ml-0.5">↗</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Links */}
            <div className="lg:w-[65%] flex flex-wrap md:flex-nowrap justify-between gap-8 md:gap-4 lg:pr-12">
              <div className="flex flex-col gap-2.5 min-w-[140px]">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Services</span>
                {['Services', 'Work', 'About', 'Culture', 'Meet The Risers'].map(link => (
                  <a key={link} href="#" className="text-sm font-bold hover:text-[#A3F1D1] transition-colors">{link}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2.5 min-w-[140px]">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Resources</span>
                {['Testimonials', 'Blog & Resources', 'Webinars', 'Careers'].map(link => (
                  <a key={link} href="#" className="text-sm font-bold hover:text-[#A3F1D1] transition-colors">{link}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2.5 min-w-[140px]">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Locations</span>
                {['Sheffield', 'Manchester', 'London', 'New York', 'Contact'].map(link => (
                  <a key={link} href="#" className="text-sm font-bold hover:text-[#A3F1D1] transition-colors">{link}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Huge Logo Section */}
          <div className="relative mb-6">
            <h1 className="text-[16vw] lg:text-[18vw] font-bold tracking-[-0.06em] leading-[0.75] whitespace-nowrap flex items-baseline -ml-7 md:-ml-11">
              Rise at Seven
              <span className="inline-flex items-center justify-center border-[2px] md:border-[3.5px] border-white rounded-full w-[0.8em] h-[0.8em] ml-[0.05em] translate-y-[-0.1em]">
                <span className="text-[0.4em] font-black">R</span>
              </span>
            </h1>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pt-8 border-t border-white/10 gap-4">
            <div className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-4xl">
              © 2025 Rise at Seven Ltd. All rights reserved • Company Number 11955187 • VAT Registered GB 322402945 • Privacy Policy • Terms & conditions
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              Website Made by <a href="#" className="text-white hover:underline">Shape</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


const Char = ({ char, index, scrollYProgress }) => {
  // Triggers slightly more towards the right (earlier in scroll)
  const sEnter = 0.33 + (index * 0.012);
  const sPeak = sEnter + 0.07;
  const sSettle = sEnter + 0.14;

  // More dramatic up-to-down wave effect
  const y = useTransform(
    scrollYProgress,
    [sEnter, sPeak, sSettle],
    [-250, 150, 0]
  );

  // Keep them straight as they move towards the left
  const rotate = useTransform(
    scrollYProgress,
    [sEnter, sPeak, sSettle],
    [-20, 10, 0]
  );

  return (
    <motion.span
      style={{ y, rotate }}
      className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-bold tracking-tighter leading-none text-[#111212] inline-block origin-center"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
};

const ScrollingText = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0.3, 0.95], ["100vw", "-100%"]);
  const text = "Ready to Rise at Seven?";

  return (
    <section ref={containerRef} className="h-screen w-full overflow-hidden bg-white flex items-center">
      <motion.div style={{ x }} className="whitespace-nowrap flex">
        {text.split("").map((char, i) => (
          <Char
            key={i}
            char={char}
            index={i}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </motion.div>
    </section>
  );
};

function App() {
  const heroRef = useRef(null);
  const featuredWorkRef = useRef(null);
  const legacyRef = useRef(null);

  return (
    <div className="min-h-screen bg-white text-[#111212] font-sans selection:bg-[#111212] selection:text-[#EFEEEC]">
      <Header heroRef={heroRef} featuredWorkRef={featuredWorkRef} legacyRef={legacyRef} />
      <main>
        <Hero ref={heroRef} />
        <DemandAndDiscovery />
        <FeaturedWork ref={featuredWorkRef} />
        <ServicesAndBanner />
        <LegacyInTheMaking ref={legacyRef} />
        <WhatsNew />
        <ScrollingText />
      </main>
      <Footer />
    </div>
  );
}

export default App;
