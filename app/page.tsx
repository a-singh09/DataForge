"use client";

import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import Stats from '@/components/landing/stats';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <Hero />
        <Features />
        <Stats />
      </div>
    </div>
  );
}