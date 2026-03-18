import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen relative">
      {/* Futuristic Animated Background Mesh */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 animate-pulse-glow"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[130px] translate-y-1/3 -translate-x-1/4"></div>
         <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      <Sidebar />
      <main className="flex-1 ml-72 p-10 overflow-y-auto relative z-10 selection:bg-primary/30 selection:text-white">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
