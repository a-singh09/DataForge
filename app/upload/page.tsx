"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Image, Code, Hash } from "lucide-react";
import UploadWrapper from "@/components/upload/upload-wrapper";
import ContentSelection from "@/components/upload/content-selection";
import FileUpload from "@/components/upload/file-upload";
import SocialMint from "@/components/upload/social-mint";
import MetadataForm from "@/components/upload/metadata-form";
import LicensingForm from "@/components/upload/licensing-form";
import MintingProgress from "@/components/upload/minting-progress";

const steps = [
  { id: "selection", title: "Content Type", icon: Upload },
  { id: "upload", title: "Upload Content", icon: FileText },
  { id: "metadata", title: "Add Metadata", icon: Hash },
  { id: "licensing", title: "Set License", icon: Code },
  { id: "minting", title: "Mint IpNFT", icon: Image },
];

function UploadContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadType, setUploadType] = useState<"file" | "social" | null>(null);
  const [uploadData, setUploadData] = useState<any>({});

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (data: any) => {
    setUploadData({ ...uploadData, ...data });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContentSelection
            selectedType={uploadType}
            onTypeSelect={setUploadType}
            onNext={handleNext}
          />
        );
      case 1:
        return uploadType === "file" ? (
          <FileUpload
            onDataChange={handleStepData}
            onNext={handleNext}
            onBack={handleBack}
          />
        ) : (
          <SocialMint
            onDataChange={handleStepData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <MetadataForm
            data={uploadData}
            onDataChange={handleStepData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <LicensingForm
            data={uploadData}
            onDataChange={handleStepData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <MintingProgress
            data={uploadData}
            onComplete={() => {
              // Redirect to dashboard or marketplace after successful minting
              // window.location.href = "/dashboard";
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mint Your <span className="gradient-text">Content</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your creative work into licensed IpNFTs and start
              earning from AI companies
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>
      </section>

      {/* Step Navigation */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-8 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                    index === currentStep
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : index < currentStep
                        ? "bg-green-500/20 text-green-400"
                        : "text-gray-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium whitespace-nowrap">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">{renderStepContent()}</div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <UploadWrapper>
      <UploadContent />
    </UploadWrapper>
  );
}
