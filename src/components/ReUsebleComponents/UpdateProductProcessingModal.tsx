import React, { useState, useEffect } from 'react';
import { Edit3, Loader2, RefreshCw, Save, CheckCircle, Settings } from 'lucide-react';

interface UpdateProductProcessingModalProps {
  isVisible: boolean;
  productName: string;
  onComplete: () => void;
}

const UpdateProductProcessingModal: React.FC<UpdateProductProcessingModalProps> = ({
  isVisible,
  productName,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    { icon: RefreshCw, text: "Updating product information", duration: 900 },
    { icon: Settings, text: "Applying modifications", duration: 1100 },
    { icon: Save, text: "Syncing changes", duration: 700 },
    { icon: CheckCircle, text: "Product updated successfully!", duration: 800 }
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
                }, 1200); // Show success for 1.2 seconds
              } else {
                // Move to next step
                stepIndex++;
                stepTimeout = setTimeout(runStep, 250);
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

  const CurrentIcon = steps[currentStep]?.icon || Edit3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
              isCompleted 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 scale-110' 
                : 'bg-gradient-to-br from-blue-400 to-blue-600'
            }`}>
              <CurrentIcon className="w-10 h-10 text-white" />
            </div>
            {/* Animated rings */}
            {!isCompleted && (
              <>
                <div className="absolute inset-0 w-20 h-20 mx-auto">
                  <div className="w-full h-full border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="absolute inset-2 w-16 h-16 mx-auto">
                  <div className="w-full h-full border-2 border-blue-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isCompleted ? 'Product Updated!' : 'Updating Product'}
          </h3>
          
          {/* Product Name */}
          <div className={`px-4 py-2 rounded-lg mb-4 transition-all duration-300 ${
            isCompleted ? 'bg-blue-100' : 'bg-blue-50'
          }`}>
            <p className={`font-medium truncate transition-colors duration-300 ${
              isCompleted ? 'text-blue-900' : 'text-blue-800'
            }`}>
              "{productName}"
            </p>
          </div>

          {/* Progress Animation */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {!isCompleted ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-gray-600">{steps[currentStep]?.text || 'Processing...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">Changes saved successfully!</span>
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
                    isActive ? 'text-blue-700 font-medium' : 
                    isCompleted ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <span>{step.text}</span>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-blue-500 ml-auto" />}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Update Badge */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
            isCompleted 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span>{isCompleted ? 'Update completed' : 'Changes detected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProductProcessingModal;