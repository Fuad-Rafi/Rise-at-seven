import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame, useMotionValue, wrap } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner class names
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function assignRef(ref, node) {
  if (ref == null) return;
  if (typeof ref === 'function') ref(node);
  else ref.current = node;
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

const ANNOUNCEMENT_PHRASE = '🚨 The Category Leaderboard - Live Now';

const AnnouncementMarquee = React.forwardRef((props, ref) => (
  <div ref={ref} className="w-full bg-white px-2 pt-2 pb-1 md:px-3 md:pt-3 md:pb-2">
    <div className="relative z-[51] overflow-hidden rounded-xl bg-[#A3F1D1] py-2 md:rounded-[1rem] md:py-3">
      <div className="flex items-center justify-center px-4">
        <a href="#" className="text-center text-[11px] font-bold uppercase tracking-wider text-[#111212] md:text-[13px]">
          {ANNOUNCEMENT_PHRASE}
        </a>
      </div>
    </div>
  </div>
));
AnnouncementMarquee.displayName = 'AnnouncementMarquee';

/** Scroll-driven nav: hide on Featured / Legacy / Ready-to-Rise; hero blend vs glass pill. */
function useSiteNav({ heroRef, featuredRef, legacyRef, scrollingRef, announcementRef }) {
  const [navVisible, setNavVisible] = useState(true);
  const [variant, setVariant] = useState('hero');
  const [navTopPx, setNavTopPx] = useState(56);

  useEffect(() => {
    let raf = 0;

    /** Hide nav only when user has scrolled into the immersive section (top edge near viewport top), not when the tall section box merely intersects from below (that hid the bar during Demand). */
    const immersiveOverlap = (r) =>
      r != null && r.bottom > 32 && r.top < window.innerHeight - 24 && r.top <= 96;

    const tick = () => {
      const feat = featuredRef.current?.getBoundingClientRect();
      const leg = legacyRef.current?.getBoundingClientRect();
      const rise = scrollingRef.current?.getBoundingClientRect();
      const hero = heroRef.current?.getBoundingClientRect();
      const ann = announcementRef.current?.getBoundingClientRect();

      let topPx = 12;
      if (ann && ann.bottom > 0) {
        topPx = ann.bottom + 8;
      }
      setNavTopPx((prev) => (Math.abs(prev - topPx) < 0.5 ? prev : topPx));

      if (immersiveOverlap(feat) || immersiveOverlap(leg) || immersiveOverlap(rise)) {
        setNavVisible(false);
        return;
      }

      setNavVisible(true);
      const pastHero = !hero || hero.bottom < 56;
      setVariant(pastHero ? 'floating' : 'hero');
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [heroRef, featuredRef, legacyRef, scrollingRef, announcementRef]);

  return { navVisible, variant, navTopPx };
}

const NavBarInner = ({
  hoveredNav,
  setHoveredNav,
  isOpen,
  setIsOpen,
  variant = 'floating',
  visible = true,
  navTopPx = 56,
}) => {
  const isHero = variant === 'hero';

  return (
    <>
      <AnimatePresence>
        {hoveredNav && visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'fixed inset-0 z-[45]',
              isHero ? 'bg-black/25 backdrop-blur-[2px]' : 'bg-black/10 backdrop-blur-md'
            )}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'fixed left-0 right-0 z-[100] mx-auto w-full max-w-[min(100%,calc(100vw-1.5rem)))] px-2 transition-opacity duration-300 md:px-3',
          !visible && 'pointer-events-none invisible opacity-0'
        )}
        style={{ top: navTopPx }}
        aria-hidden={!visible}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-full px-4 py-3 transition-all duration-300 md:px-8 md:py-4',
            isHero
              ? 'border border-transparent bg-transparent shadow-none'
              : 'border border-white/55 bg-white/45 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/35'
          )}
        >
          <div
            className={cn(
              'shrink-0 text-lg font-bold tracking-tighter md:text-2xl',
              isHero ? 'text-white' : 'text-[#111212]'
            )}
          >
            Rise at Seven<span className={cn('text-base md:text-lg', isHero ? 'text-white' : '')}>↘</span>
          </div>

          <nav className="hidden min-w-0 flex-1 justify-center xl:flex xl:px-2">
            <div
              className={cn(
                'flex flex-wrap items-center justify-center gap-0.5 text-[11px] font-bold tracking-wide lg:gap-1 lg:text-[12px] xl:text-[13px]',
                isHero ? 'text-white' : 'text-[#111212]'
              )}
            >
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
                      'block rounded-full px-3 py-2 transition-all duration-300 lg:px-4',
                      hoveredNav === item
                        ? isHero
                          ? 'bg-white text-[#111212]'
                          : 'bg-[#111212] text-white'
                        : isHero
                          ? 'text-white hover:bg-white/15 hover:text-white'
                          : 'text-[#111212] hover:text-gray-700'
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
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute left-1/2 top-full z-[60] mt-4 flex w-[min(100vw-2rem,350px)] -translate-x-1/2 rounded-[1.5rem] bg-white p-2 shadow-2xl"
                      >
                        <div className="flex w-1/2 items-center justify-center p-4 text-center">
                          <h3 className="text-xl font-bold leading-tight tracking-tight text-[#111212]">
                            {item === 'Services +'
                              ? 'B2B Marketing'
                              : item === 'Industries +'
                                ? 'Retail & eCommerce'
                                : item === 'International +'
                                  ? 'Global Reach'
                                  : 'Our Story'}
                          </h3>
                        </div>
                        <div className="relative aspect-square w-1/2 overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={`https://picsum.photos/400/400?random=${item.length * 5}`}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <a
                href="#"
                className={cn(
                  'relative flex items-center px-3 py-2 lg:px-4',
                  isHero ? 'text-white hover:text-white/80' : 'text-[#111212] hover:text-gray-700'
                )}
              >
                Work
                <span className="absolute right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#A3F1D1] text-[9px] font-bold text-black">
                  25
                </span>
              </a>
              <a
                href="#"
                className={cn('px-2 py-2', isHero ? 'text-white hover:text-white/80' : 'hover:text-gray-700')}
              >
                Careers
              </a>
              <a
                href="#"
                className={cn('px-2 py-2', isHero ? 'text-white hover:text-white/80' : 'hover:text-gray-700')}
              >
                Blog & Resources +
              </a>
              <a
                href="#"
                className={cn('px-2 py-2', isHero ? 'text-white hover:text-white/80' : 'hover:text-gray-700')}
              >
                Webinar
              </a>
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              className={cn(
                'hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-[12px] font-bold tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] md:flex md:px-6 md:text-[13px]',
                isHero ? 'bg-white text-[#111212]' : 'bg-[#111212] text-white'
              )}
            >
              Get In Touch <span>↗</span>
            </button>
            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center space-y-1.5 xl:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              <motion.span
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className={cn('h-0.5 w-7 origin-center', isHero ? 'bg-white' : 'bg-[#111212]')}
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className={cn('h-0.5 w-7 origin-center', isHero ? 'bg-white' : 'bg-[#111212]')}
              />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex flex-col bg-[#111212] p-6 pt-28"
          >
            <div className="flex flex-col space-y-8 text-3xl font-bold uppercase tracking-tighter text-white sm:text-4xl">
              {['Services', 'Work', 'About', 'Culture', 'Careers', 'Blog'].map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="hover:text-gray-400"
                  onClick={() => setIsOpen(false)}
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

const HeroWithNav = React.forwardRef((props, ref) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 180]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.35]);

  return (
    <section ref={ref} className="w-full bg-white px-2 pb-0 pt-1 md:px-3 md:pt-2 md:pb-0">
      <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col rounded-3xl md:min-h-[calc(100dvh-3rem)] md:rounded-[2.5rem]">
        {/* Clipped background — hero content; nav is fixed in App */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl bg-[#0a0a0a] md:rounded-[2.5rem]">
          <img
            src="https://picsum.photos/1920/1080?random=20"
            alt=""
            className="h-full min-h-[120%] w-full scale-105 object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/75" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col pt-14 md:pt-16">
          <motion.div
            style={{ y, opacity }}
            className="flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-2 text-center md:px-8 md:pb-8 md:pt-4"
          >
            <div className="mb-5 flex max-w-4xl flex-col items-center space-y-3 md:mb-8 md:space-y-4">
              <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-white md:text-xs md:tracking-[0.2em]">
                #1 Most recommended
                <br />
                content marketing agency
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 opacity-90 md:gap-3">
                {['AWARDS', 'THE DRUM', 'GLOBAL SEARCH'].map((t) => (
                  <span
                    key={t}
                    className="rounded border border-white/35 px-2 py-1 text-[9px] font-semibold text-white md:text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="flex w-full max-w-6xl flex-col items-center text-5xl font-bold leading-[0.92] tracking-tighter text-white sm:text-6xl md:text-8xl lg:text-[8.5rem] xl:text-[9.25rem]">
              <span className="flex items-baseline gap-1">
                <span className="text-[0.35em] font-bold text-white/80">#</span>
                <span>We Create</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center justify-center gap-2 md:mt-2 md:gap-4 lg:gap-5">
                <span>Category</span>
                <img
                  src="https://picsum.photos/160/160?random=21"
                  alt=""
                  className="h-14 w-14 rounded-2xl object-cover md:h-24 md:w-24 lg:h-28 lg:w-28 lg:rounded-3xl"
                />
                <span>Leaders</span>
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-lg font-medium tracking-tight text-white md:mt-8 md:text-2xl lg:text-3xl">
              on every searchable platform
            </p>

            <motion.div
              style={{ opacity }}
              className="mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-3 md:mt-10 md:gap-x-8 md:gap-y-4"
            >
              {['Google', 'ChatGPT', 'Gemini', 'TikTok', 'YouTube', 'Pinterest', 'GIPHY', 'reddit', 'amazon'].map((platform) => (
                <span key={platform} className="text-sm font-bold tracking-tight text-white/95 md:text-base">
                  {platform}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <div className="relative z-10 mt-auto grid w-full gap-6 px-5 pb-10 pt-4 text-white md:grid-cols-2 md:gap-8 md:px-10 md:pb-14 md:pt-6">
            <p className="max-w-lg text-left text-[11px] font-semibold leading-relaxed text-white/95 md:text-sm md:leading-relaxed">
              Organic media planners creating, distributing &amp; optimising search-first content for SEO, Social, PR, AI and LLM
              search.
            </p>
            <p className="max-w-lg text-left text-[11px] font-semibold leading-relaxed text-white/95 md:text-right md:text-sm md:leading-relaxed lg:justify-self-end">
              4 Global Offices serving UK, USA (New York) &amp; EU.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

const DemandAndDiscovery = () => {
  const logos = ['Emirates', 'Shark NINJA', 'CapitalOne', 'Red Bull', 'JD', 'HubSpot', 'XBOX', 'Emirates', 'Shark NINJA', 'CapitalOne', 'Red Bull', 'JD'];

  const segment = (
    <div className="flex shrink-0 items-center gap-12 md:gap-20 lg:gap-24">
      {logos.map((logo, i) => (
        <span key={`${logo}-${i}`} className="text-lg font-bold tracking-tighter text-black/50 md:text-xl">
          {logo}
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative z-20 overflow-hidden bg-white pb-16 text-black md:pb-20">
      {/* Agency strip + client marquee */}
      <div className="border-b border-gray-300/60 px-2 py-6 md:px-6">
        <div className="mx-auto flex w-full max-w-[2000px] flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <div className="flex shrink-0 items-center gap-3 text-black/70">
            <span className="text-xs font-bold tracking-tight md:text-sm">The agency behind ...</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-400/80 text-xs font-light text-black md:h-8 md:w-8">
              +
            </span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <motion.div className="flex w-max" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, ease: 'linear', duration: 32 }}>
              {segment}
              {segment}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[2000px] px-2 pt-10 md:px-6 md:pt-16 lg:pt-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-16 md:gap-24 lg:gap-32">
          {/* Left Column: Descriptive Text - Extreme Left */}
          <div className="flex-shrink-0 lg:w-[28%] lg:pb-32">
            <Reveal>
              <p className="max-w-xs text-base font-medium leading-[1.3] tracking-tight text-black md:text-lg">
                A global team of search-first content marketers engineering semantic relevancy &amp; category signals for both the
                internet and people.
              </p>
            </Reveal>
          </div>

          {/* Right Column: Hero Headline & Buttons - Extreme Right */}
          <div className="flex flex-col items-start lg:items-start lg:w-auto max-w-4xl">
            <Reveal delay={0.15}>
              <h2 className="mb-8 text-[2.5rem] font-bold leading-[0.85] tracking-[-0.04em] text-black sm:text-4xl md:mb-10 md:text-5xl lg:text-[5.5rem] xl:text-[6.5rem]">
                <span className="block">Driving Demand &amp;</span>
                <span className="flex items-center gap-4">
                  <span>Discovery</span>
                  <img
                    src="https://picsum.photos/100/100?random=30"
                    alt=""
                    className="h-8 w-8 rounded-xl border border-gray-300/80 object-cover md:h-10 md:w-10 lg:h-12 lg:w-12 lg:rounded-2xl"
                  />
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.25} className="flex flex-wrap gap-4">
              <button
                type="button"
                className="group flex items-center gap-2.5 rounded-full border border-gray-300 bg-white px-6 py-3 text-[12px] font-bold tracking-tight text-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                Our Story <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </button>
              <button
                type="button"
                className="group flex items-center gap-2.5 rounded-full border border-gray-300 bg-white px-6 py-3 text-[12px] font-bold tracking-tight text-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                Our Services <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

const WorkTitle = ({ work, i, total, scrollYProgress, setIsHovering }) => {
  const isLastTwo = work.client === 'Leading E Sim brand globally';
  const firstPart = isLastTwo ? 'Leading E Sim' : work.client;
  const secondPart = isLastTwo ? 'brand globally' : '';

  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, (i - 1.5) / total), i / total, Math.min(1, (i + 1.5) / total)],
    [1, 1, 1]
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
      onMouseEnter={() => setIsHovering && setIsHovering(i)}
      onMouseLeave={() => setIsHovering && setIsHovering(null)}
    >
      <div className="flex items-start">
        <h3 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-bold tracking-tighter leading-[0.9] text-white">
          {firstPart}
        </h3>
        {work.year && (
          <span className="font-mono text-[9px] md:text-[11px] text-white ml-2 mt-4 opacity-40">
            {work.year}
          </span>
        )}
      </div>
      {secondPart && (
        <h3 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-bold tracking-tighter leading-[0.9] text-white">
          {secondPart}
        </h3>
      )}
    </motion.div>
  );
};

const FeaturedWork = React.forwardRef((props, ref) => {
  const works = [
    { client: 'JD Sports', year: '[2023-2025]', img: 'https://picsum.photos/1000/1200?random=40', tag: 'Car rental' },
    { client: 'Dojo', year: '[2021-2025]', img: 'https://picsum.photos/1000/1200?random=41', tag: 'Fintech' },
    { client: 'Magnet Trade', year: '[2023-2024]', img: 'https://picsum.photos/1000/1200?random=42', tag: 'B2B Trade' },
    { client: 'Pookie', year: '[2023-2025]', img: 'https://picsum.photos/1000/1200?random=43', tag: 'Tech' },
    { client: 'Easy peasy', year: '[2025]', img: 'https://picsum.photos/1000/1200?random=44', tag: 'Retail' },
    { client: 'Parkdean Resorts', year: '[2019-2025]', img: 'https://picsum.photos/1000/1200?random=45', tag: 'Travel' }
  ];

  const containerRef = useRef(null);
  const setSectionRef = useCallback(
    (node) => {
      containerRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

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

  // Per-item motion values so each left title and right image use the same progress curve
  const itemOpacities = works.map((_, i) =>
    useTransform(
      scrollYProgress,
      [Math.max(0, (i - 1.5) / works.length), i / works.length, Math.min(1, (i + 1.5) / works.length)],
      [1, 1, 1]
    )
  );

  const itemScales = works.map((_, i) =>
    useTransform(
      scrollYProgress,
      [Math.max(0, (i - 1) / works.length), i / works.length, Math.min(1, (i + 1) / works.length)],
      [0.95, 1, 0.95]
    )
  );

  const itemYs = works.map((_, i) =>
    useTransform(
      scrollYProgress,
      [Math.max(0, (i - 1) / works.length), i / works.length, Math.min(1, (i + 1) / works.length)],
      ["12%", "0%", "-12%"]
    )
  );

  return (
    <section ref={setSectionRef} className="bg-white w-full h-[400vh] relative z-20">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="bg-[#111212] w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">

          {/* Left Side - Information (Smooth Scrolling Titles) */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 lg:px-20 relative z-20 bg-[#111212] text-white">
            <div className="absolute top-12 md:top-20 left-8 md:left-16 lg:left-20">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white opacity-60">Featured Work</h2>
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
                    setIsHovering={setIsHovering}
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
              {works.map((work, i) => {
                const hoverActive = isHovering === i;
                return (
                  <motion.div
                    key={i}
                    style={{ opacity: itemOpacities[i], y: itemYs[i], scale: itemScales[i] }}
                    className="featured-work-image w-full flex-shrink-0"
                  >
                    <div
                      className="relative w-full aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-xl group"
                      onMouseEnter={() => setIsHovering(i)}
                      onMouseLeave={() => setIsHovering(null)}
                      onMouseMove={(e) => handleMouseMove(e, i)}
                    >
                      {/* Main Image */}
                      <img
                        src={work.img}
                        alt={work.client}
                        className="absolute inset-0 w-full h-full object-cover opacity-100 brightness-110 contrast-105 saturate-110 transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Hover Overlay */}
                      <div className={cn(
                        "absolute inset-0 transition-all duration-500 ease-out flex flex-col justify-between p-8 md:p-12 z-10",
                        (hoverActive ? "opacity-100" : "opacity-0"),
                        i % 2 === 0 ? "bg-[#fbd2d7]" : "bg-[#bde6ff]",
                        "group-hover:opacity-100"
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
                    <div className={cn(
                      "absolute bottom-4 right-4 md:bottom-6 md:right-6 transition-opacity duration-300",
                      hoverActive ? 'opacity-0' : 'opacity-100',
                      'group-hover:opacity-0'
                    )}>
                      <button className="bg-[#111212]/60 text-white backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-[12px] font-bold tracking-wide border border-white/20 flex items-center gap-2 hover:bg-white hover:text-black transition-colors duration-300">
                        <span className="text-lg leading-none mt-[-2px]">⚲</span> {work.tag} <span className="ml-1">↘</span>
                      </button>
                    </div>
                    </div>
                  </motion.div>
                );
              })}
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
        className="relative py-8 md:py-10 border-b border-gray-300 group cursor-pointer transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Default Text (Visible when NOT hovered) */}
        <div className={cn(
          "text-4xl md:text-5xl lg:text-[4rem] font-semibold tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
            <span className="text-4xl md:text-5xl lg:text-[4.5rem] font-light leading-none transform group-hover:rotate-0 -rotate-12 transition-transform duration-500">↗</span>
            <span className="text-4xl md:text-5xl lg:text-[4rem] font-semibold tracking-tighter">{title}</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

const ParallaxMarquee = ({ children, baseVelocity = -0.2 }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [-1000, 1000], [5, -5], {
    clamp: false
  });

  // Wrap values to ensure seamless looping
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  useAnimationFrame((t, delta) => {
    // baseVelocity is the constant drift to the left
    let moveBy = baseVelocity * (delta / 1000);

    // velocityFactor adds/subtracts from that drift based on scroll
    // but the baseVelocity will eventually win out when scrolling stops
    moveBy += velocityFactor.get() * (delta / 1000);

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap flex-nowrap">
      <motion.div className="flex whitespace-nowrap flex-nowrap" style={{ x }}>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
};

const ServicesAndBanner = () => {
  const pairRow = (
    <div className="flex items-center">
      {[0, 1].map((pair) => (
        <div key={pair} className="flex items-center gap-6 pr-12 md:gap-12 md:pr-24 lg:gap-16 lg:pr-32">
          <h2 className="whitespace-nowrap text-[5rem] md:text-[8rem] lg:text-[10rem] font-[900] leading-none tracking-tighter text-black">
            Chasing Consumers Not Algorithms
          </h2>
          <img
            src="https://picsum.photos/240/240?random=51"
            alt=""
            className="h-20 w-20 shrink-0 rounded-3xl border border-gray-300 object-cover md:h-36 md:w-36 lg:h-44 lg:w-44 xl:h-52 xl:w-52"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-white text-black pt-24 pb-32 relative z-30">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 md:mb-24">
          <Reveal>
            <h2 className="text-5xl md:text-[5rem] lg:text-[6.5rem] font-semibold tracking-tighter leading-none flex items-center gap-4">
              Our
              <img src="https://picsum.photos/120/120?random=50" className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-3xl object-cover -mt-2" alt="Services" />
              Services
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 md:mt-0">
            <button className="bg-white px-8 py-3.5 rounded-full text-[13px] font-bold tracking-wide border border-gray-200 hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm flex items-center gap-2">
              View All Services <span>↗</span>
            </button>
          </Reveal>
        </div>

        <div className="border-t border-gray-300 pt-8 pb-12 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 lg:gap-x-40 xl:gap-x-64">
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

      {/* Marquee: Scroll-reactive parallax movement */}
      <div className="flex w-full pt-8 md:pt-12">
        <ParallaxMarquee baseVelocity={-0.67}>
          {pairRow}
        </ParallaxMarquee>
      </div>
    </section>
  );
};

const LegacyInTheMaking = React.forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const setSectionRef = useCallback(
    (node) => {
      containerRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

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
    <section ref={setSectionRef} className="relative h-[300vh] bg-white w-full z-10 pb-32">
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
        className="flex flex-col group"
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
      category: 'News',
      title: 'Rise at Seven Appoints Hollie Lovell as Senior Operations Lead',
      author: 'Ray Saddiq',
      time: '3 mins',
      img: 'https://picsum.photos/800/800?random=102',
      avatar: 'https://i.pravatar.cc/100?u=hollie',
    },
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
    <footer className="bg-white px-2 pb-2 md:px-3 md:pb-3">
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

const ScrollingText = React.forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const setSectionRef = useCallback(
    (node) => {
      containerRef.current = node;
      assignRef(ref, node);
    },
    [ref]
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0.3, 0.95], ["100vw", "-100%"]);
  const text = "Ready to Rise at Seven?";

  return (
    <section ref={setSectionRef} className="flex h-screen w-full items-center overflow-hidden bg-white">
      <motion.div style={{ x }} className="flex whitespace-nowrap">
        {text.split("").map((char, i) => (
          <Char key={i} char={char} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </motion.div>
    </section>
  );
});
ScrollingText.displayName = 'ScrollingText';

function App() {
  const heroRef = useRef(null);
  const featuredWorkRef = useRef(null);
  const legacyRef = useRef(null);
  const scrollingTextRef = useRef(null);
  const announcementRef = useRef(null);

  const [hoveredNav, setHoveredNav] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { navVisible, variant, navTopPx } = useSiteNav({
    heroRef,
    featuredRef: featuredWorkRef,
    legacyRef,
    scrollingRef: scrollingTextRef,
    announcementRef,
  });

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-white text-[#111212] font-sans selection:bg-[#111212] selection:text-[#EFEEEC]">
      <AnnouncementMarquee ref={announcementRef} />
      <NavBarInner
        hoveredNav={hoveredNav}
        setHoveredNav={setHoveredNav}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        variant={variant}
        visible={navVisible}
        navTopPx={navTopPx}
      />
      <main>
        <HeroWithNav ref={heroRef} />
        <DemandAndDiscovery />
        <FeaturedWork ref={featuredWorkRef} />
        <ServicesAndBanner />
        <LegacyInTheMaking ref={legacyRef} />
        <WhatsNew />
        <ScrollingText ref={scrollingTextRef} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
