import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-6">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Link to="/" className="flex flex-col items-center gap-4 group">
          <img 
            src="https://banco.az/sites/default/files/news/asan_xidmet.jpg" 
            alt="ASAN Logo" 
            className="h-24 w-auto object-contain rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-500"
          />
          <div className="text-center">
            <span className="font-black text-2xl text-asan-blue tracking-tighter uppercase">Avtomatlaşdırılmış Növbə</span>
            <div className="h-1 w-12 bg-asan-blue mx-auto mt-1 rounded-full opacity-50"></div>
          </div>
        </Link>
      </div>
      <Link 
        to="/admin/login" 
        className="absolute top-4 right-4 text-gray-300 hover:text-asan-blue text-xs font-bold transition-all uppercase tracking-widest"
      >
        Admin
      </Link>
    </nav>
  );
};

export default Navbar;
