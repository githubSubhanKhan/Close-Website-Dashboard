import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

const FacultyReviews = () => {
  const containerRef = useRef(null);
  const [animationSpeed, setAnimationSpeed] = useState(50); // seconds for one complete cycle
  
  const reviews = [
    {
      review: "The library's AI recommendation system has transformed how I discover new research papers. It accurately predicts materials relevant to my current projects.",
      name: "Prof. Abdul Rehman",
      department: "Department of Computer Science",
    },
    {
      review: "This AI tool saves me hours of manual searching. The personalized recommendations are impressively accurate and have introduced me to crucial resources I might have missed.",
      name: "Dr. Nida Tariq",
      department: "Department of Civil Engineering",
    },
    {
      review: "The recommendation algorithm understands my research patterns and consistently suggests valuable technical papers. An essential tool for any academic.",
      name: "Prof. Usman Ghani",
      department: "Mechanical Engineering",
    },
    {
      review: "I'm impressed by how the AI adapts to my changing research interests. The cross-disciplinary recommendations have opened new avenues for my work.",
      name: "Dr. Sadia Khan",
      department: "Department of Electrical Engineering",
    },
    {
      review: "The library's AI tool has a remarkable ability to surface obscure but relevant mathematical texts. Its precision in understanding complex academic requirements is outstanding.",
      name: "Prof. Imran Ali",
      department: "Department of Mathematics",
    },
  ];

  return (
    <section className="w-full py-8 overflow-hidden bg-gray-50">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">Faculty Feedback on NextBook</h2>
        <p className="text-gray-600 text-center">See how our intelligent library tool is enhancing research</p>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-6 px-4"
          style={{
            animation: `scrollX ${animationSpeed}s linear infinite`,
            display: "flex",
            whiteSpace: "nowrap"
          }}
        >
          {reviews.concat(reviews).map((review, idx) => (
            <Card 
              key={idx} 
              className="w-80 bg-white rounded-lg shadow-md flex-shrink-0 border border-gray-200 transform transition-transform hover:shadow-lg"
            >
              <CardContent className="p-6 flex flex-col text-black h-full">
                <Quote className="text-redcustom w-8 h-8 mb-3" />
                
                <div className="flex-grow">
                  <p className="text-base whitespace-normal leading-relaxed mb-6">
                    "{review.review}"
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 w-full mt-auto">
                  <h4 className="font-semibold text-gray-800">{review.name}</h4>
                  <span className="text-sm text-gray-500">{review.department}</span>
                </div>
              </CardContent>
            </Card>        
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollX {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${reviews.length * 336}px);
          }
        }
        
        @media (max-width: 768px) {
          @keyframes scrollX {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-${reviews.length * 300}px);
            }
          }
        }
      `}</style>
    </section>
  );
};

export default FacultyReviews;