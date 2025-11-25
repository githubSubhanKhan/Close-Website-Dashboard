import { Star, Heart, ExternalLink, Check, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Book } from "@/services/api.types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import nedLogo from "../images/NEDUET_logo.svg.png";

// Update or extend the Book interface if needed
interface BookSummaryProps {
  book: Book & { 
    biblioId?: string | number | null 
  };
}

const BookSummary = ({ book }: BookSummaryProps) => {
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [biblioId, setBiblioId] = useState<string | number | null>(book.biblioId || null); // Properly typed
  const rating = book.averageRatings ? parseFloat(book.averageRatings.$numberInt) : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < Math.round(rating) ? "text-yellow-500" : "text-gray-300"}`}
        fill={index < Math.round(rating) ? "#facc15" : "none"}
      />
    ));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    // const currentDate = new Date().toLocaleDateString();

    const img = new Image();
    img.src = nedLogo;

    img.onload = () => {
      doc.addImage(img, "PNG", 14, 10, 20, 20);
      doc.setFontSize(12);
      const pageWidth = doc.internal.pageSize.getWidth(); // Usually 210mm for A4

      // doc.text("NED UNIVERSITY OF ENGINEERING & TECHNOLOGY", 40, 20);
      const text = "NED UNIVERSITY OF ENGINEERING & TECHNOLOGY";
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 20);

      // doc.text("ENGR. ABUL KALAM LIBRARY", 38, 28);
      const libName = "ENGR. ABUL KALAM LIBRARY";
      const libNameWidth = doc.getTextWidth(libName);
      const libDimension = (pageWidth - libNameWidth) / 2;
      doc.text(libName, libDimension, 28);

      doc.setFontSize(8);
      const firstCheck = "Recurring Budget";
      const firstCheckWidth = doc.getTextWidth(firstCheck);
      doc.text(firstCheck, pageWidth - firstCheckWidth - 14, 28);
      const secondCheck = "Other (Specify)";
      const secondCheckWidth = doc.getTextWidth(secondCheck);
      doc.text(secondCheck, pageWidth - secondCheckWidth - 14, 34);

      doc.setFontSize(12);

      const titleDetail = "Requisition Form for Book and Non-Book Materials";
      // doc.text("Requisition Form for Book and Non-Book Materials", 38, 36);
      const titleDetailWidth = doc.getTextWidth(titleDetail);
      const titleDetailDimension = (pageWidth - titleDetailWidth) / 2;
      doc.text(titleDetail, titleDetailDimension, 36);

      // doc.text(`Date of Requisition: ${currentDate}`, 14, 50);
      // doc.text(`Name of Department: `, 30, 50);
      const dateText = `Date of Requisition: __________`;
      const departmentText = "Name of Department: __________________";

      doc.text(dateText, 14, 50); // Left aligned

      const departmentTextWidth = doc.getTextWidth(departmentText);
      doc.text(departmentText, pageWidth - departmentTextWidth - 14, 50); // Right aligned with 14mm margin


      // Build the first row with book data
      const firstRow: string[] = [
        "1",
        book.title?.toUpperCase() || "",
        book.authors?.[0] || "",
        book.publisher?.[0] || "",
        book.isbn?.[0] || "",
        "", // Edition
        "", // Price
        ""  // Supplier
      ];

      // Create 9 empty rows
      const emptyRows: string[][] = Array.from({ length: 9 }, () =>
        ["", "", "", "", "", "", "", ""]
      );

      // Combine into one body array
      const body: string[][] = [firstRow, ...emptyRows];

      const tableHead = [[
        "S. No.",
        "Title / Edn. / Vol. / Year",
        "Author",
        "Publisher",
        "ISBN/ ISSN",
        "Req. Qty.",
        "Price",
        "Supplier/ Vendor"
      ]];

      // Pass to autoTable
      autoTable(doc, {
        head: tableHead,
        body: body,
        startY: 70,
      });


      const pageHeight = doc.internal.pageSize.getHeight(); // Usually 297mm for A4
      const bottomY = pageHeight - 30; // 30mm from bottom, adjust if needed

      // First row: Labels
      doc.setFontSize(11);
      doc.text("RECOMMENDED BY:", 14, bottomY);
      doc.text("CHAIRMAN", 60, bottomY);
      doc.text("DEAN", 100, bottomY);
      doc.text("ASST. LIBRARIAN", 135, bottomY);
      doc.text("CHIEF LIBRARIAN", 175, bottomY);

      // Second row: Notes
      doc.setFontSize(8);
      doc.text("(Name & Signature)", 14, bottomY + 7);
      doc.text("(Signature & Stamp)", 60, bottomY + 7);
      doc.text("(Signature & Stamp)", 100, bottomY + 7);
      doc.text("Acq. & Collection Dev. Section", 135, bottomY + 7);


      doc.save(`${book.title?.replace(/\s+/g, '_') || 'book'}_request.pdf`);
    };
  };

  const shareBook = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopiedMessage(true);
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000);
    });
  };

  // Reset copied message when component unmounts
  useEffect(() => {
    return () => {
      if (showCopiedMessage) {
        setShowCopiedMessage(false);
      }
    };
  }, [showCopiedMessage]);

  // Function to search for a book's biblionumber in the library by ISBN
  const findBookInLibrary = async () => {
    if (!book.isbn?.length) {
      alert("No ISBN available for this book");
      return;
    }
    
    try {
      setIsRedirecting(true);
      
      // If we already have the biblioId, use it directly
      if (biblioId) {
        redirectToBookDetail(biblioId);
        return;
      }
      
      // Use the API to search for the book's biblionumber
      const apiUrl = "https://eakl.neduet.edu.pk/api/v1";
      const credentials = btoa("nextBook:nexBook123"); // Base64 encode the credentials
      
      const isbn = book.isbn[0];
      
      // Based on the Koha API documentation, we need to find an endpoint that can search by ISBN
      // This could be something like /biblios?q=isbn:${isbn} or similar
      // Let's try a few potential endpoints
      
      // First attempt: Try to use a direct search endpoint if available
      try {
        const searchResponse = await fetch(`${apiUrl}/biblios?q=isbn:${isbn}`, {
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
          }
        });
        
        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          
          if (searchResults && searchResults.length > 0) {
            // Extract biblionumber from results
            const foundBiblioId = searchResults[0].biblionumber;
            setBiblioId(foundBiblioId);
            redirectToBookDetail(foundBiblioId);
            return;
          }
        }
      } catch (searchError) {
        console.warn("First search method failed:", searchError);
        // Continue to next attempt
      }
      
      // If we couldn't find the book through search, fall back to direct ISBN search
      redirectToIsbnSearch();
      
    } catch (error) {
      console.error("Error finding book in library:", error);
      alert("Failed to connect to library. Please try again later.");
      setIsRedirecting(false);
    }
  };
  
  // Redirect to the book detail page using biblionumber
  const redirectToBookDetail = (id: string | number) => {
    window.location.href = `https://eakl.neduet.edu.pk/cgi-bin/koha/opac-detail.pl?biblionumber=${id}`;
  };
  
  // Fall back to ISBN search if we can't get the biblionumber
  const redirectToIsbnSearch = () => {
    if (!book.isbn?.length) {
      alert("No ISBN available for this book");
      setIsRedirecting(false);
      return;
    }
    
    const isbn = book.isbn[0];
    window.open(`https://eakl.neduet.edu.pk/cgi-bin/koha/opac-search.pl?q=isbn:${isbn}`, "_blank");
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="relative min-h-[300px] flex items-center justify-center">
          {!imageLoaded && (
            <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded flex items-center justify-center">
              <p className="text-gray-500">Loading image...</p>
            </div>
          )}
          <img
            src={book.thumbnailUrl || "/placeholder-book.jpg"}
            alt={book.title}
            className={`w-full h-auto max-h-[400px] object-contain ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">{book.title}</h2>
            <button onClick={() => setLiked(!liked)}>
              <Heart
                className={`w-6 h-6 transition-colors ${liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
              />
            </button>
          </div>

          <p className="text-gray-600 text-lg">
            by {book.authors?.join(", ") || "Unknown author"}
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="outline" disabled>
              Year: {book.publicationYear?.$numberInt || "N/A"}
            </Button>
            <Button variant="outline" disabled>
              Publisher: {book.publisher?.join(", ") || "Unknown"}
            </Button>
            <Button variant="outline" disabled className="flex items-center gap-1">
              {renderStars(rating)}
              <span>({rating.toFixed(1)})</span>
            </Button>
            
            {book.availableInLibrary && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1 font-medium">
                <Check className="w-4 h-4" />
                <span>Available in Library</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center mt-6">
            {book.availableInLibrary ? (
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={findBookInLibrary}
                
              >
                <Library className="w-4 h-4" />
                {  "SEE BOOK IN LIBRARY"}
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={generatePDF}
              >
                REQUEST PURCHASE
              </Button>
            )}
            <Button variant="secondary">LEARN MORE</Button>
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-black"
                onClick={shareBook}
              >
                <ExternalLink className="w-5 h-5" />
                <span>Share</span>
              </div>
              {showCopiedMessage && (
                <div className="absolute -bottom-8 left-0 bg-black text-white text-xs py-1 px-2 rounded shadow-md whitespace-nowrap">
                  Link copied to clipboard!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-8 md:px-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Book Details</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Subjects</h3>
            <p className="text-gray-700">
              {book.subject?.join(", ") || "No subjects available"}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">ISBN</h3>
            <p className="text-gray-700">
              {book.isbn?.join(", ") || "ISBN not available"}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Summary</h3>
            <p className="text-gray-700">{book.summary}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookSummary;
