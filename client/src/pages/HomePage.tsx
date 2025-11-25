// HomePage.tsx
import React from "react";
import Navbar from "@/components/ui/Navbar";
import SearchSection from "@/components/ui/SearchSection";
import RecommendBooks from "@/components/ui/RecommendBooks";
import FooterSection from "@/components/layouts/FooterSection";

const HomePage: React.FC = () => {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar />
        <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
          <SearchSection />
          <RecommendBooks />
        </section>
      <FooterSection />
      </div>
    </>
  );
};

export default HomePage;
