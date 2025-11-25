// Sidebar.tsx
import React, { useState } from 'react';
import { HomeIcon, ClockIcon, HeartIcon, ArrowRight, ArrowLeft } from 'lucide-react'; // Adjust the import based on your icon library

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`flex ${isOpen ? 'w-64' : 'w-16'} transition-width duration-300 h-full`}>
            <button onClick={toggleSidebar} className="p-4">
                {isOpen ? <ArrowLeft></ArrowLeft>:<ArrowRight></ArrowRight>}
            </button>
            <div className={`flex flex-col items-start mt-4 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
                    <HomeIcon className="mr-2" />
                    {isOpen && <span>Home</span>}
                </div>
                <div className="flex items-center  p-2 hover:bg-gray-700 cursor-pointer">
                    <ClockIcon className="mr-2" />
                    {isOpen && <span>History</span>}
                </div>
                <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
                    <HeartIcon className="mr-2" />
                    {isOpen && <span>Favourites</span>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;