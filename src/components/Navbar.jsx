import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="sticky top-0 bg-orange-500 text-white shadow-md z-10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Cartir_total</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/data" className="hover:underline">Data</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
