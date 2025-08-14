"use client";

import { Button } from "@/components/ui/button";
import {
  Wallet,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { AuthModal } from "@/components/auth/AuthModal";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Instant Monetization",
    description: "Turn your content into revenue streams within minutes",
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "IpNFTs with embedded licensing on BaseCAMP L1",
  },
  {
    icon: TrendingUp,
    title: "95% Creator Royalties",
    description: "Keep almost everything you earn from AI training",
  },
];

export default function Hero() {
  const { authenticated, loading } = useAuthState();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-4 h-4 bg-orange-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-green-400 rounded-full animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">
              IpNFT transactions on BaseCAMP L1
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block">Monetize Your</span>
            <span className="block gradient-text">Content for AI</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            Turn your creative work into IpNFTs with embedded licensing. Earn
            from AI companies while maintaining full control and ownership.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {loading ? (
              <div className="animate-pulse bg-gray-700 h-14 w-64 rounded-md"></div>
            ) : !authenticated ? (
              <div className="flex items-center">
                <AuthModal />
              </div>
            ) : (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg"
                >
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            )}

            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-float"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
    </section>
  );
}
