import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import QueueForm from './components/QueueForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-inter relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-asan-blue rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-asan-blue rounded-full blur-[120px]"></div>
        </div>
        
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
          <Routes>
            <Route path="/" element={<QueueForm />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <footer className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
          © 2026 ASAN Smart Queue System • Rəqəmsal Gələcək
        </footer>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '20px',
              background: '#333',
              color: '#fff',
              padding: '16px 24px',
              fontWeight: 'bold',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
