import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Sparkles } from "lucide-react";

const SearchSection: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const placeholderTexts = [
    "Find me textbooks on machine learning and AI fundamentals...",
    "Recommend advanced books on quantum computing...",
    "Looking for civil engineering resources on structural analysis...",
    "Show me academic references on cybersecurity frameworks...",
    "Find books about robotics and mechanical design...",
    "Suggest recent publications on renewable energy systems...",
    "Need graduate-level texts on computer vision algorithms...",
    "Find academic books on network security protocols...",
    "Recommend resources on advanced materials science...",
    "Looking for engineering mathematics references...",
  ];

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect for placeholder
  useEffect(() => {
    const typingSpeed = 70;
    const deletingSpeed = 40;
    const pauseTime = 2000;
    
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting && displayedPlaceholder === placeholderTexts[currentPlaceholderIndex]) {
      // Pause at the end of typing
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayedPlaceholder === "") {
      // Move to next placeholder
      setIsDeleting(false);
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    } else if (isDeleting) {
      // Delete character
      timeout = setTimeout(() => {
        setDisplayedPlaceholder((prev) => prev.slice(0, -1));
      }, deletingSpeed);
    } else {
      // Type character
      timeout = setTimeout(() => {
        setDisplayedPlaceholder((prev) => 
          placeholderTexts[currentPlaceholderIndex].slice(0, prev.length + 1)
        );
      }, typingSpeed);
    }
    
    return () => clearTimeout(timeout);
  }, [currentPlaceholderIndex, displayedPlaceholder, isDeleting, placeholderTexts]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  

  return (
    <section className="w-full px-4 py-6 md:py-12 text-center relative">
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        
        .ai-search-gradient {
          background: linear-gradient(90deg, 
            rgba(136, 0, 21, 0.05), 
            rgba(227, 230, 242, 0.1), 
            rgba(242, 223, 216, 0.08),
            rgba(136, 0, 21, 0.05));
          background-size: 300% 300%;
          animation: gradientMove 6s ease infinite;
        }
        
        .ai-spark {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(136, 0, 21, 0.7);
          filter: blur(1px);
          z-index: 10;
        }
        
        .suggestions-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(227, 230, 242, 0.5);
          border-radius: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 640px) {
          .search-container {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        <div className="mb-2 flex items-center justify-center">
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2 text-red-800 opacity-80" />
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">Explore The Library</h1>
        </div>
        
        <div className="relative mt-4 md:mt-6">
          {/* Improved responsive container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 max-w-xl mx-auto">
            <div className="relative w-full">
              <div className="ai-search-gradient p-1 rounded-lg">
                <div className="bg-white rounded-md relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={displayedPlaceholder}
                    className="w-full pr-10 border-2 hover:border-red-800/30 focus:border-red-800/50 transition-all text-sm md:text-base"
                    onKeyDown={handleKeyDown}
                  />
                  <BookOpen className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Suggestions dropdown - improved positioning */}
              {suggestions.length > 0 && (
                <div className="suggestions-container absolute mt-1 w-full z-10 text-left">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-2 md:px-4 text-xs md:text-sm hover:bg-gray-100 cursor-pointer text-gray-700"
                      onClick={() => {
                        setSearchInput(suggestion.replace('...', ''));
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              className="w-full sm:w-auto mt-2 sm:mt-0" 
              onClick={handleSearch}
              size="sm"
            >
              <Search className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Explore</span>
            </Button>
          </div>
        </div>
        
        {/* Decorative sparks - adjusted for responsiveness */}
        <div className="ai-spark hidden md:block" style={{top: '30%', left: '30%', animation: 'float 4s ease-in-out infinite'}}></div>
        <div className="ai-spark hidden md:block" style={{top: '60%', right: '35%', animation: 'float 5s ease-in-out infinite 1s'}}></div>
        <div className="ai-spark hidden md:block" style={{bottom: '20%', left: '40%', animation: 'float 6s ease-in-out infinite 2s'}}></div>
      </div>
    </section>
  );
};

export default SearchSection;