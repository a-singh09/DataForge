"use client";

import { useEffect, useState } from "react";
import { Users, FileText, DollarSign, Building } from "lucide-react";

const stats = [
  {
    icon: Users,
    label: "Beta Creators",
    value: 42,
    suffix: "+",
    color: "text-orange-400",
  },
  {
    icon: FileText,
    label: "Datasets Uploaded",
    value: 127,
    suffix: "+",
    color: "text-purple-400",
  },
  {
    icon: DollarSign,
    label: "Demo Transactions",
    value: 15420,
    prefix: "$",
    suffix: "+",
    color: "text-green-400",
  },
  {
    icon: Building,
    label: "Partner Projects",
    value: 8,
    suffix: "+",
    color: "text-blue-400",
  },
];

function AnimatedCounter({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(target * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <span>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Building the Future of
            <span className="block gradient-text">AI Data Markets</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Early metrics from our hackathon prototype showcasing the potential
            of decentralized AI training data marketplaces.
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="text-sm text-orange-400 font-medium">
              🚀 Hackathon Demo
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>

                  {/* Number */}
                  <div
                    className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}
                  >
                    <AnimatedCounter
                      target={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>

                  {/* Label */}
                  <p className="text-gray-400 font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">Ready to explore the prototype?</p>
          <div className="inline-flex items-center space-x-2 text-sm text-orange-400">
            <span>Try the demo platform</span>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
