"use client";

import { 
  Coins,
  Share2,
  BarChart3,
  Link,
  Bot,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Coins,
    title: 'IpNFT Minting',
    description: 'Transform your content into blockchain-secured intellectual property with embedded licensing terms.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Bot,
    title: 'Fixed-Price AI Licensing',
    description: 'Set transparent, fixed prices for AI companies to license your content for training purposes.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Automated Royalties',
    description: 'Earn 95% royalties automatically distributed through smart contracts on every license purchase.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Link,
    title: 'Social Integration',
    description: 'Connect Twitter, Spotify, TikTok, and Telegram to mint content directly from your profiles.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Monitor your content performance, license sales, and revenue with comprehensive dashboards.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Globe,
    title: 'Decentralized Marketplace',
    description: 'Browse and discover training datasets from creators worldwide in our gasless marketplace.',
    color: 'from-teal-500 to-teal-600'
  }
];

export default function Features() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for
            <span className="block gradient-text">Modern Creators</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to monetize your content in the age of AI, 
            built on cutting-edge blockchain technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  {/* Icon */}
                  <div className={`h-14 w-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">Secured by BaseCAMP L1 blockchain</span>
          </div>
        </div>
      </div>
    </section>
  );
}