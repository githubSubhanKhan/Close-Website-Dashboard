import React, { useState, useEffect } from "react";

const LoadingAnimation = ({ progress = 0 }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Connecting to Close CRM", icon: "🔗" },
    { label: "Fetching lead records", icon: "📊" },
    { label: "Loading appointments", icon: "📅" },
    { label: "Processing memberships", icon: "💳" },
    { label: "Calculating analytics", icon: "📈" },
    { label: "Almost ready", icon: "✨" },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 800);

    return () => {
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Animated Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="w-24 h-24 border-4 border-gray-200 rounded-full animate-spin border-t-[#880015]"></div>
              
              {/* Inner pulsing circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#880015] to-[#E60026] rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-2xl">{steps[currentStep].icon}</span>
                </div>
              </div>
              
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="w-3 h-3 bg-[#E60026] rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                <div className="w-3 h-3 bg-[#FF3347] rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Loading Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              Fetching your CRM data...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#880015] via-[#E60026] to-[#FF3347] rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.min(Math.round(progress), 100)}%</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 min-h-[60px] flex items-center justify-center">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">
                  {steps[currentStep].icon}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {steps[currentStep].label}
                </span>
              </div>
              {/* Animated dots */}
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-[#880015] rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-[#880015] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-[#880015] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? "w-8 bg-gradient-to-r from-[#880015] to-[#E60026]"
                    : "w-1.5 bg-gray-300"
                }`}
              ></div>
            ))}
          </div>

          {/* Fun Facts */}
          <div className="text-center">
            <p className="text-xs text-gray-400 italic">
              Did you know? Close CRM helps teams close deals faster 🚀
            </p>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#E60026] rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          50% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0.1;
          }
          90% {
            opacity: 0.2;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-float {
          animation: float 10s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;