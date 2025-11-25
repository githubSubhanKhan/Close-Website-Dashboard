import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const FooterSection: React.FC = () => {
  const columns = [
    {
      title: "Useful Links",
      items: ["Library Catalog", "Research Databases", "Technologies Used"],
    },
    {
      title: "Quick Access",
      items: ["Hours & Location", "Library Staff", "Contact Us"],
      href: ["", "", ""],
    },
    {
      title: "University Resources",
      items: ["NED University Website", "Academic Calendar", "Student Portal"],
      href: ["", "", ""],
    },
    {
      title: "Legal",
      items: ["Privacy Policy", "Terms of Service", "Cookies Policy"],
      href: ["", "", ""],
    },
  ];

  return (
    <footer className="mt-10">
      <div className="mx-auto px-6">
        {/* Footer Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((column, index) => (
            <div key={index} className="text-center">
              <h3 className="font-semibold text-lg mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.items.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mt-8">
          <a href="" target="_blank" rel="noopener noreferrer">
            <div className="w-12 h-12 bg-redcustom text-white rounded-full flex items-center justify-center">
              <Facebook className="w-6 h-6" />
            </div>
          </a>
          <a href="" target="_blank" rel="noopener noreferrer">
            <div className="w-12 h-12 bg-redcustom text-white rounded-full flex items-center justify-center">
              <Twitter className="w-6 h-6" />
            </div>
          </a>
          <a href="" target="_blank" rel="noopener noreferrer">
            <div className="w-12 h-12 bg-redcustom text-white rounded-full flex items-center justify-center">
              <Instagram className="w-6 h-6" />
            </div>
          </a>
          <a href="" target="_blank" rel="noopener noreferrer">
            <div className="w-12 h-12 bg-redcustom text-white rounded-full flex items-center justify-center">
              <Linkedin className="w-6 h-6" />
            </div>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm mt-4">
          &copy; {new Date().getFullYear()} EAKL. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
