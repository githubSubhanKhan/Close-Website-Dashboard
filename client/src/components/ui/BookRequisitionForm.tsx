// src/components/ui/BookRequisitionForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Book } from "@/services/api.types";

interface BookRequisitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSubmit: (formData: RequisitionFormData) => Promise<void>;
}

export interface RequisitionFormData {
  dateOfRequisition: string;
  department: string;
  bookDetails: {
    title: string;
    author: string;
    publisher: string;
    isbn: string;
    reqQuantity: number;
    price: string;
    supplier: string;
  }[];
  budgetType: "recurring" | "other";
  otherBudgetSpecify?: string;
}

const BookRequisitionForm = ({ isOpen, onClose, book, onSubmit }: BookRequisitionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RequisitionFormData>({
    dateOfRequisition: new Date().toISOString().split('T')[0],
    department: "",
    bookDetails: [{
      title: book.title || "",
      author: book.authors?.join(", ") || "",
      publisher: book.publisher?.join(", ") || "",
      isbn: book.isbn?.[0] || "",
      reqQuantity: 1,
      price: "",
      supplier: ""
    }],
    budgetType: "recurring"
  });

  // Update form when book changes
  useEffect(() => {
    if (book) {
      setFormData(prev => ({
        ...prev,
        bookDetails: [{
          title: book.title || "",
          author: book.authors?.join(", ") || "",
          publisher: book.publisher?.join(", ") || "",
          isbn: book.isbn?.[0] || "",
          reqQuantity: 1,
          price: "",
          supplier: ""
        }]
      }));
    }
  }, [book]);

  const handleInputChange = (field: keyof RequisitionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookDetailChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newBookDetails = [...prev.bookDetails];
      newBookDetails[index] = { ...newBookDetails[index], [field]: value };
      return { ...prev, bookDetails: newBookDetails };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit requisition:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            NED UNIVERSITY OF ENGINEERING & TECHNOLOGY
          </DialogTitle>
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold">ENGR. ABUL KALAM LIBRARY</h2>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="recurringBudget"
                  checked={formData.budgetType === "recurring"}
                  onChange={() => setFormData(prev => ({ ...prev, budgetType: "recurring" }))}
                />
                <label htmlFor="recurringBudget">Recurring Budget</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="otherBudget"
                  checked={formData.budgetType === "other"}
                  onChange={() => setFormData(prev => ({ ...prev, budgetType: "other" }))}
                />
                <label htmlFor="otherBudget">Other (Specify)</label>
              </div>
            </div>
            {formData.budgetType === "other" && (
              <Input 
                className="mt-2 max-w-xs mx-auto"
                placeholder="Specify budget type"
                value={formData.otherBudgetSpecify || ""}
                onChange={(e) => handleInputChange("otherBudgetSpecify", e.target.value)}
              />
            )}
            <h3 className="text-base mt-3">Requisition Form for Book and Non-Book Materials</h3>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <label className="text-sm font-medium">Date of Requisition:</label>
            <Input 
              type="date"
              value={formData.dateOfRequisition}
              onChange={(e) => handleInputChange("dateOfRequisition", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Name of Department:</label>
            <Input 
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-sm">S.No.</th>
                <th className="border px-2 py-1 text-sm">Title / Edn. / Vol. / Year</th>
                <th className="border px-2 py-1 text-sm">Author</th>
                <th className="border px-2 py-1 text-sm">Publisher</th>
                <th className="border px-2 py-1 text-sm">ISBN/ ISSN</th>
                <th className="border px-2 py-1 text-sm">Req. Qty.</th>
                <th className="border px-2 py-1 text-sm">Price</th>
                <th className="border px-2 py-1 text-sm">Supplier/ Vendor</th>
              </tr>
            </thead>
            <tbody>
              {formData.bookDetails.map((book, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1">
                    <Input 
                      value={book.title}
                      onChange={(e) => handleBookDetailChange(index, "title", e.target.value)}
                      className="text-sm h-8"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      value={book.author}
                      onChange={(e) => handleBookDetailChange(index, "author", e.target.value)}
                      className="text-sm h-8"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      value={book.publisher}
                      onChange={(e) => handleBookDetailChange(index, "publisher", e.target.value)}
                      className="text-sm h-8"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      value={book.isbn}
                      onChange={(e) => handleBookDetailChange(index, "isbn", e.target.value)}
                      className="text-sm h-8"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      type="number"
                      value={book.reqQuantity}
                      onChange={(e) => handleBookDetailChange(index, "reqQuantity", parseInt(e.target.value) || 1)}
                      className="text-sm h-8"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      value={book.price}
                      onChange={(e) => handleBookDetailChange(index, "price", e.target.value)}
                      className="text-sm h-8"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      value={book.supplier}
                      onChange={(e) => handleBookDetailChange(index, "supplier", e.target.value)}
                      className="text-sm h-8"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="border-t pt-2">
            <div className="text-xs text-center mb-1">RECOMMENDED BY:</div>
            <div className="text-xs text-center">(Name & Signature)</div>
          </div>
          <div className="border-t pt-2">
            <div className="text-xs text-center mb-1">CHAIRMAN</div>
            <div className="text-xs text-center">(Signature & Stamp)</div>
          </div>
          <div className="border-t pt-2">
            <div className="text-xs text-center mb-1">DEAN</div>
            <div className="text-xs text-center">(Signature & Stamp)</div>
          </div>
          <div className="border-t pt-2">
            <div className="text-xs text-center mb-1">CHIEF LIBRARIAN</div>
            <div className="text-xs text-center"></div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Requisition"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookRequisitionForm;