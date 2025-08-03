import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Package, Sparkles, Zap, CheckCircle } from 'lucide-react';

interface CreateProductProcessingModalProps {
  isVisible: boolean;
  productName: string;
  onComplete: () => void;
}

const CreateProductProcessingModal: React.FC<CreateProductProcessingModalProps> = ({
  isVisible,
  productName,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    { icon: Package, text: "Setting up product details", duration: 800 },
    { icon: Sparkles, text: "Processing images", duration: 1200 },
    { icon: Zap, text: "Configuring pricing tiers", duration: 600 },
    { icon: CheckCircle, text: "Product created successfully!", duration: 800 }
  ];

  useEffect(() => {
    if (!isVisible) {
      // Reset when modal is hidden
      setProgress(0);
      setCurrentStep(0);
      setIsCompleted(false);
      return;
    }

    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startProgress = () => {
      let currentProgress = 0;
      let stepIndex = 0;

      const runStep = () => {
        if (stepIndex < steps.length) {
          setCurrentStep(stepIndex);
          
          const stepDuration = steps[stepIndex].duration;
          const progressPerMs = (100 / steps.length) / stepDuration;
          
          progressInterval = setInterval(() => {
            currentProgress += progressPerMs * 50; // Update every 50ms
            
            if (currentProgress >= ((stepIndex + 1) * (100 / steps.length))) {
              currentProgress = (stepIndex + 1) * (100 / steps.length);
              setProgress(currentProgress);
              clearInterval(progressInterval);
              
              if (stepIndex === steps.length - 1) {
                // Last step - show completion
                setIsCompleted(true);
                stepTimeout = setTimeout(() => {
                  onComplete();
                }, 1000); // Show success for 1 second
              } else {
                // Move to next step
                stepIndex++;
                stepTimeout = setTimeout(runStep, 300);
              }
            } else {
              setProgress(currentProgress);
            }
          }, 50);
        }
      };

      runStep();
    };

    startProgress();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep]?.icon || Package;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
              isCompleted 
                ? 'bg-gradient-to-br from-green-500 to-green-600 scale-110' 
                : 'bg-gradient-to-br from-green-400 to-green-600'
            }`}>
              <CurrentIcon className="w-10 h-10 text-white" />
            </div>
            {/* Animated rings */}
            {!isCompleted && (
              <>
                <div className="absolute inset-0 w-20 h-20 mx-auto">
                  <div className="w-full h-full border-4 border-green-200 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="absolute inset-2 w-16 h-16 mx-auto">
                  <div className="w-full h-full border-2 border-green-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isCompleted ? 'Product Created!' : 'Creating Product'}
          </h3>
          
          {/* Product Name */}
          <div className={`px-4 py-2 rounded-lg mb-4 transition-all duration-300 ${
            isCompleted ? 'bg-green-100' : 'bg-green-50'
          }`}>
            <p className={`font-medium truncate transition-colors duration-300 ${
              isCompleted ? 'text-green-900' : 'text-green-800'
            }`}>
              "{productName}"
            </p>
          </div>

          {/* Progress Animation */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {!isCompleted ? (
              <>
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                <span className="text-gray-600">{steps[currentStep]?.text || 'Processing...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Successfully created!</span>
              </>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="text-left space-y-3 mb-6">
            {steps.slice(0, -1).map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 text-sm transition-all duration-300 ${
                    isActive ? 'text-green-700 font-medium' : 
                    isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-green-600' : 
                    isCompleted ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span>{step.text}</span>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Status Message */}
          <p className={`text-sm transition-all duration-300 ${
            isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'
          }`}>
            {isCompleted ? 'Ready to use!' : 'Please wait...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateProductProcessingModal;