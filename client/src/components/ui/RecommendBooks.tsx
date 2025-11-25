
import React, { useState, useEffect } from "react"
import { Heart, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

// Temporary static book data (replace with API call later)
const getBooks = () => [
  {
    id: "6804c809ce3927767a7233ca",
    title: "Machine Learning",
    image: "https://ia800100.us.archive.org/view_archive.php?archive=/5/items/l_covers_0012/l_covers_0012_79.zip&file=0012794807-L.jpg",
  },
  {
    id: "6804c809ce3927767a72145f",
    title: "Data Science: A First Introduction",
    image: "https://res.cloudinary.com/dknekr0vz/image/upload/v1745146083/book_thumbnails/f5cspmsqgi3xx65edtkv.jpg",
  },
  {
    id: "6804c809ce3927767a72126f",
    title: "Foundations of Discrete Mathematics with Algorithms and Programming",
    image: "https://res.cloudinary.com/dknekr0vz/image/upload/v1745152474/book_thumbnails/uyk7bcykj92hl8yrvgmn.png",
  },
  {
    id: "6804c809ce3927767a721db0",
    title: "Mathematics with Applications in the Management, Natural, and Social Sciences",
    image: "https://res.cloudinary.com/dknekr0vz/image/upload/v1745150878/book_thumbnails/book_6070.png",
  },
  {
    id: "6804c809ce3927767a720d53",
    title: "Mechanical Engineering Principles 4th Ed",
    image: "https://res.cloudinary.com/dknekr0vz/image/upload/v1745144440/book_thumbnails/amgoadajvpndy1bplr8d.jpg",
  },
  {
    id: "6804c809ce3927767a720e83",
    title: "Manufacturing and Enterprise",
    image: "https://res.cloudinary.com/dknekr0vz/image/upload/v1745171273/book_thumbnails/book_1418.png",
  },
  {
    id: "6804c809ce3927767a721519",
    title: "Artificial Intelligence Theory, Models, and Applications",
    image: "https://res.cloudinary.com/dknekr0vz/image/upload/v1745150907/book_thumbnails/jwr7xmckejzsx7tqnkkb.png",
  },
  {
    id: "6804c809ce3927767a72467b",
    title: "Security in the Cyber Age",
    image: "https://covers.openlibrary.org/b/id/14823787-L.jpg",
  },
];

const RecommendBooks = () => {
  // Fixed type to use string instead of number for book IDs
  const [likedBooks, setLikedBooks] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [bookRatings, setBookRatings] = useState<Record<string, number>>({});
  const books = getBooks();
  const navigate = useNavigate();

  // Generate random ratings on component mount
  useEffect(() => {
    const ratings: Record<string, number> = {};
    books.forEach(book => {
      // Generate random rating between 1 and 5
      ratings[book.id] = Math.floor(Math.random() * 5) + 1;
    });
    setBookRatings(ratings);
  }, []);

  // Function to toggle liked state for a specific book
  const toggleLike = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    setLikedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  // Function to navigate to book details page
  const navigateToBook = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  // Function to handle image load
  const handleImageLoad = (bookId: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [bookId]: true
    }));
  };

  return (
    <section className="w-full px-4 py-8 md:py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
        Top Searches This Week
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {books.map((book) => (
          <Card 
            key={book.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateToBook(book.id)}
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-md">
                {/* Placeholder while image loads */}
                {!loadedImages[book.id] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={book.image}
                  alt={book.title}
                  className={`w-full h-full object-contain rounded-md transition-opacity duration-300 ${
                    loadedImages[book.id] ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(book.id)}
                />
              </div>

              {/* Fixed height container for title and like button */}
              <div className="flex justify-between items-start h-14 mb-2">
                <h3 className="font-medium text-sm md:text-base line-clamp-2 pr-2">{book.title}</h3>
                <button 
                  onClick={(e) => toggleLike(e, book.id)} 
                  className="focus:outline-none flex-shrink-0"
                  aria-label={likedBooks[book.id] ? "Unlike book" : "Like book"}
                >
                  <Heart
                    className={`w-4 h-4 cursor-pointer transition-all ${
                      likedBooks[book.id] ? "fill-red-500 text-red-500" : "text-red-500"
                    }`}
                  />
                </button>
              </div>
              
              {/* Stars with consistent position at bottom */}
              <div className="flex items-center mt-auto">
                {Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`w-4 h-4 text-yellow-500 ${
                        idx < (bookRatings[book.id] || 0) ? "fill-yellow-500" : ""
                      }`}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecommendBooks