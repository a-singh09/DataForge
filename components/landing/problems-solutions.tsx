"use client";

import {
  AlertTriangle,
  DollarSign,
  Shield,
  Users,
  CheckCircle,
  Coins,
  BarChart3,
  Award,
} from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Licensing Uncertainty",
    description:
      "Most datasets lack clear commercial licensing terms, creating legal risks for AI companies.",
    category: "AI Companies",
  },
  {
    icon: Shield,
    title: "Legal Risk",
    description:
      'Using "free" datasets without proper licensing can lead to costly legal disputes.',
    category: "AI Companies",
  },
  {
    icon: DollarSign,
    title: "No Monetization",
    description:
      "Valuable training data shared freely with no compensation for creators.",
    category: "Data Creators",
  },
  {
    icon: Users,
    title: "No Recognition",
    description:
      "Creators rarely receive attribution for their contributions to AI breakthroughs.",
    category: "Data Creators",
  },
];

const solutions = [
  {
    icon: Shield,
    title: "Clear Licensing",
    description:
      "Every dataset has transparent, legally-binding license terms stored on-chain.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Coins,
    title: "Creator Compensation",
    description:
      "Automated royalty distribution ensures creators are fairly compensated.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "Usage Tracking",
    description:
      "Blockchain records provide complete audit trails for compliance.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description:
      "Community-driven ratings and verification systems ensure data quality.",
    color: "from-purple-500 to-purple-600",
  },
];

export default function ProblemsAndSolutions() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Solving Critical
            <span className="block gradient-text">AI Industry Challenges</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The AI training data ecosystem is broken. DataForge fixes it with
            blockchain-verified licensing and decentralized ownership.
          </p>
        </div>

        {/* Problems Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-red-400">
              Current Industry Problems
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Both AI companies and data creators face significant challenges in
              today's ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <div
                  key={problem.title}
                  className="group glass rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold">
                          {problem.title}
                        </h4>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                          {problem.category}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solutions Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-green-400">
              How DataForge Solves These Problems
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our blockchain-powered platform addresses every major pain point
              in the AI training data market
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <div
                  key={solution.title}
                  className="group glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 border border-green-500/20 hover:border-green-500/40"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={`h-12 w-12 bg-gradient-to-br ${solution.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <h4 className="text-lg font-semibold mb-3 group-hover:text-green-400 transition-colors">
                      {solution.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 border border-green-500/30">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">
              Built on BaseCAMP L1 for maximum security and transparency
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
