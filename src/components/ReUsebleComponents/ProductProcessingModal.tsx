import React, { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Camera, Wand2, Gift, Heart } from 'lucide-react';

interface ProductProcessingModalProps {
  isVisible: boolean;
  productName?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const ProductProcessingModal: React.FC<ProductProcessingModalProps> = ({ 
  isVisible, 
  productName = "Product",
  onComplete,
  onError 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  const phases = [
    {
      title: "Taking Perfect Photos",
      subtitle: "Making your product look amazing ✨",
      color: "from-purple-400 to-pink-400",
      icon: Camera,
      duration: 25
    },
    {
      title: "Adding Magic Touch",
      subtitle: "Enhancing colors and quality 🎨",
      color: "from-blue-400 to-purple-400", 
      icon: Wand2,
      duration: 35
    },
    {
      title: "Almost Ready",
      subtitle: "Final touches for perfection 💫",
      color: "from-green-400 to-blue-400",
      icon: Sparkles,
      duration: 25
    },
    {
      title: "Going Live",
      subtitle: "Publishing to your store 🚀",
      color: "from-orange-400 to-red-400",
      icon: Gift,
      duration: 15
    }
  ];

  // Generate floating elements
  useEffect(() => {
    if (isVisible) {
      const elements = Array.from({length: 8}, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setFloatingElements(elements);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentPhase(0);
      setIsComplete(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        
        // Determine current phase
        let cumulativeProgress = 0;
        let phaseIndex = 0;
        
        for (let i = 0; i < phases.length; i++) {
          cumulativeProgress += phases[i].duration;
          if (newProgress <= cumulativeProgress) {
            phaseIndex = i;
            break;
          }
        }
        
        if (phaseIndex !== currentPhase) {
          setCurrentPhase(phaseIndex);
        }
        
        if (newProgress >= 100) {
          setIsComplete(true);
          setTimeout(() => onComplete?.(), 2000);
          clearInterval(interval);
          return 100;
        }
        
        return newProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isVisible, currentPhase, onComplete]);

  if (!isVisible) return null;

  const currentPhaseData = phases[currentPhase];
  const Icon = currentPhaseData?.icon || Camera;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${3 + element.delay}s`
            }}
          />
        ))}
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        
        {/* Animated gradient header */}
        <div className={`h-2 bg-gradient-to-r ${currentPhaseData?.color || 'from-purple-400 to-pink-400'} transition-all duration-1000`} />
        
        <div className="p-8">
          {!isComplete ? (
            <>
              {/* Main animation area */}
              <div className="text-center mb-8">
                {/* Animated icon */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentPhaseData?.color} opacity-20 animate-ping`} />
                  <div className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${currentPhaseData?.color} flex items-center justify-center transform transition-all duration-500 hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>

                {/* Product name */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Creating "{productName}"
                </h2>
                
                {/* Phase description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    {currentPhaseData?.title}
                  </h3>
                  <p className="text-gray-500">
                    {currentPhaseData?.subtitle}
                  </p>
                </div>
              </div>

              {/* Beautiful progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {Math.round(progress)}%
                  </span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out relative rounded-full"
                      style={{ 
                        width: `${progress}%`,
                        background: currentPhase === 0 ? 'linear-gradient(to right, #c084fc, #f472b6)' :
                                   currentPhase === 1 ? 'linear-gradient(to right, #60a5fa, #c084fc)' :
                                   currentPhase === 2 ? 'linear-gradient(to right, #4ade80, #60a5fa)' :
                                   'linear-gradient(to right, #fb923c, #ef4444)'
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Progress indicator dot */}
                  <div 
                    className="absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 transition-all duration-500 shadow-lg"
                    style={{ 
                      left: `calc(${progress}% - 8px)`,
                      background: currentPhase === 0 ? 'linear-gradient(to right, #c084fc, #f472b6)' :
                                 currentPhase === 1 ? 'linear-gradient(to right, #60a5fa, #c084fc)' :
                                 currentPhase === 2 ? 'linear-gradient(to right, #4ade80, #60a5fa)' :
                                 'linear-gradient(to right, #fb923c, #ef4444)'
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                  </div>
                </div>
              </div>

              {/* Phase indicators */}
              <div className="flex justify-center space-x-3 mb-6">
                {phases.map((phase, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index <= currentPhase 
                        ? `bg-gradient-to-r ${phase.color} shadow-lg scale-110` 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Encouraging message */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Hang tight! We're making your product look absolutely stunning 🌟
                </p>
              </div>
            </>
          ) : (
            /* Success celebration */
            <div className="text-center py-4">
              {/* Success animation */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 w-24 h-24 bg-green-100 rounded-full animate-ping" />
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                🎉 You're All Set!
              </h2>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6">
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  "{productName}" is now live! 
                </p>
                <p className="text-gray-600">
                  Your customers can start ordering right away ✨
                </p>
              </div>
              
              {/* Success icons */}
              <div className="flex justify-center space-x-4 text-2xl">
                {['🎊', '💖', '🌟', '🎯', '🚀'].map((emoji, i) => (
                  <span
                    key={i}
                    className="animate-bounce"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom decoration */}
        {!isComplete && (
          <div className="px-8 pb-6">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentPhaseData?.color} animate-bounce`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductProcessingModal;