"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Check,
  Clock,
  Zap,
  ExternalLink,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface MintingProgressProps {
  data: any;
  onComplete: () => void;
}

const mintingSteps = [
  { id: 'preparing', title: 'Preparing Content', description: 'Processing files and metadata' },
  { id: 'uploading', title: 'Uploading to IPFS', description: 'Storing content on decentralized storage' },
  { id: 'minting', title: 'Minting IpNFT', description: 'Creating blockchain record with licensing' },
  { id: 'marketplace', title: 'Adding to Marketplace', description: 'Making your content discoverable' },
  { id: 'complete', title: 'Complete!', description: 'Your content is now live and earning' },
];

export default function MintingProgress({ data, onComplete }: MintingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [txHash, setTxHash] = useState('0x1234567890abcdef...');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < mintingSteps.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          return prev;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const progress = ((currentStep + 1) / mintingSteps.length) * 100;

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-2xl p-8 mb-8">
          {/* Success Animation */}
          <div className="h-24 w-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Check className="h-12 w-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold mb-4 gradient-text">
            IpNFT Minted Successfully!
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Your content is now live on the marketplace and ready to earn revenue
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Content Details</h3>
              <p className="text-gray-400 text-sm mb-2">{data.metadata?.title}</p>
              <p className="text-orange-400 font-medium">
                {data.licensing?.fixedPrice} {data.licensing?.paymentToken} per license
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Blockchain Record</h3>
              <p className="text-gray-400 text-sm mb-2">Transaction Hash:</p>
              <p className="text-blue-400 font-mono text-xs">
                {txHash}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
            
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => window.location.href = '/marketplace'}
            >
              View in Marketplace
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Minting Your IpNFT</h2>
        <p className="text-gray-400 text-lg">
          Please wait while we process your content and create the blockchain record
        </p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Overall Progress</span>
            <span className="text-orange-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {mintingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-500 ${
                index < currentStep 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : index === currentStep
                  ? 'bg-orange-500/10 border border-orange-500/20'
                  : 'bg-gray-800/30'
              }`}
            >
              {/* Step Icon */}
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-orange-500'
                  : 'bg-gray-600'
              }`}>
                {index < currentStep ? (
                  <Check className="h-5 w-5 text-white" />
                ) : index === currentStep ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Clock className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  index <= currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
                
                {index === currentStep && (
                  <div className="mt-3 flex items-center space-x-2 text-orange-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">In Progress...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Info */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Network:</span>
            <span className="text-green-400">BaseCAMP L1</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">Gas Fee:</span>
            <span className="text-green-400">$0.00 (Gasless)</span>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400">
        <p>This process usually takes 2-3 minutes. Please don't close this window.</p>
      </div>
    </div>
  );
}