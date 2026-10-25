'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 1,
    image: '/hero/hero-1.webp',
    storagePath: 'hero/hero-1.webp',
    badge: 'NEW COLLECTION 2026',
    title: 'MADE FOR THE JOURNEY',
    subtitle: 'Pakaian harian berbahan premium terinspirasi dari alam, petualangan, dan kultur kontemporer.',
    primaryBtn: { text: 'EXPLORE COLLECTION', href: '/shop' },
    secondaryBtn: { text: 'CUSTOM APPAREL', href: '/custom' },
  },
  {
    id: 2,
    image: '/hero/hero-2.webp',
    storagePath: 'hero/hero-2.webp',
    badge: 'OUTDOOR & ADVENTURE',
    title: 'INSPIRED BY NATURE',
    subtitle: 'Koleksi esensial dirancang untuk ketangguhan eksplorasi dan kenyamanan setiap langkah petualangan.',
    primaryBtn: { text: 'LIHAT KATALOG', href: '/shop' },
    secondaryBtn: { text: 'CUSTOM SABLON', href: '/custom' },
  },
  {
    id: 3,
    image: '/hero/hero-3.webp',
    storagePath: 'hero/hero-3.webp',
    badge: 'STREETWEAR DISTRO',
    title: 'AUTHENTIC ESSENTIALS',
    subtitle: 'Potongan boxy & oversize bergaya streetwear modern dengan 100% Cotton Combed premium.',
    primaryBtn: { text: 'BELANJA SEKARANG', href: '/shop' },
    secondaryBtn: { text: 'CUSTOM DESAIN', href: '/custom' },
  },
  {
    id: 4,
    image: '/hero/hero-4.webp',
    storagePath: 'hero/hero-4.webp',
    badge: 'PREMIUM CRAFTSMANSHIP',
    title: 'CRAFTED WITH PRECISION',
    subtitle: 'Detail jahitan rantai rapi, sablon DTF & discharge beresolusi tajam, tahan cuci ratusan kali.',
    primaryBtn: { text: 'ORDER CUSTOM', href: '/custom' },
    secondaryBtn: { text: 'PRODUK TERBARU', href: '/shop' },
  },
  {
    id: 5,
    image: '/hero/hero-5.webp',
    storagePath: 'hero/hero-5.webp',
    badge: 'WILDERNESS SPIRIT',
    title: 'TEMUKAN ARAHMU',
    subtitle: 'Perpaduan estetika minimalis Lombok dengan standar pakaian kasual global yang abadi.',
    primaryBtn: { text: 'JELAJAHI KOLEKSI', href: '/shop' },
    secondaryBtn: { text: 'PELAJARI CUSTOM', href: '/custom' },
  },
];

// Interval pergantian background: tepat setiap 3 detik
const AUTO_PLAY_INTERVAL = 3000;

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [direction, setDirection] = useState('left');
  const [isPaused, setIsPaused] = useState(false);
  const [imgSources, setImgSources] = useState(() =>
    SLIDES.map((s) => s.image)
  );

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const transitionTimerRef = useRef(null);

  // Preload background images & setup Supabase storage fallback
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      setImgSources(
        SLIDES.map((s) => `${supabaseUrl}/storage/v1/object/public/site-assets/${s.storagePath}`)
      );
    }

    // Preload all slides into browser cache for instant transitions
    SLIDES.forEach((s) => {
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.src = s.image;
      }
    });
  }, []);

  const handleImgError = (idx) => {
    // If remote storage fails, fallback to local WebP file
    setImgSources((prev) => {
      const next = [...prev];
      next[idx] = SLIDES[idx].image;
      return next;
    });
  };

  const changeSlide = useCallback((newIndex, newDirection = 'left') => {
    if (newIndex === currentIndex) return;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    setPrevIndex(currentIndex);
    setDirection(newDirection);
    setCurrentIndex(newIndex);

    transitionTimerRef.current = setTimeout(() => {
      setPrevIndex(null);
    }, 850);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % SLIDES.length;
    changeSlide(nextIdx, 'left');
  }, [currentIndex, changeSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + SLIDES.length) % SLIDES.length;
    changeSlide(prevIdx, 'right');
  }, [currentIndex, changeSlide]);

  const goToSlide = useCallback((idx) => {
    if (idx === currentIndex) return;
    changeSlide(idx, idx > currentIndex ? 'left' : 'right');
  }, [currentIndex, changeSlide]);

  // Auto-play timer: berganti otomatis setiap 3 detik bergeser dari kanan ke kiri
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Cleanup transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Touch swipe support untuk mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      className="hero hero-slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Slideshow"
    >
      {/* Background Slides Track */}
      <div className="hero-slides-track">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isExiting = idx === prevIndex;

          let animClass = '';
          if (isActive && prevIndex !== null) {
            animClass = direction === 'right' ? 'is-entering-right' : 'is-entering-left';
          } else if (isExiting) {
            animClass = direction === 'right' ? 'is-exiting-right' : 'is-exiting-left';
          }

          return (
            <div
              key={slide.id}
              className={`hero-slide-item ${isActive ? 'is-active' : ''} ${animClass}`}
              aria-hidden={!isActive}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSources[idx] || slide.image}
                alt={slide.title}
                onError={() => handleImgError(idx)}
                className="hero-slide-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}
      </div>

      {/* Atmospheric Overlays */}
      <div className="hero-overlay hero-slideshow-overlay" />

      {/* Slide Content */}
      <div className="hero-content hero-slideshow-content">
        <div
          key={currentSlide.id}
          className={`hero-text-anim ${direction === 'left' ? 'anim-slide-left' : 'anim-slide-right'}`}
        >
          <h1 className="hero-title">{currentSlide.title}</h1>
          <p className="hero-subtitle">{currentSlide.subtitle}</p>

          <div className="hero-actions">
            <Link href={currentSlide.primaryBtn.href} className="btn btn-hero-primary">
              {currentSlide.primaryBtn.text}
            </Link>
            {currentSlide.secondaryBtn && (
              <Link href={currentSlide.secondaryBtn.href} className="btn btn-hero-secondary">
                {currentSlide.secondaryBtn.text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="hero-nav-btn hero-nav-prev"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        className="hero-nav-btn hero-nav-next"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Slide Indicators / Dots */}
      <div className="hero-indicators">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            className={`hero-indicator-dot ${idx === currentIndex ? 'is-active' : ''}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Pindah ke slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
