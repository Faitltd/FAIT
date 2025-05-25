import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavigationTestPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Navigation Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Using Link Component</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Home
          </Link>
          <Link to="/projects" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Projects
          </Link>
          <Link to="/services" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Services
          </Link>
          <Link to="/estimates" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Estimates
          </Link>
          <Link to="/warranty" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Warranty
          </Link>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Using useNavigate Hook</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => handleNavigate('/')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavigate('/projects')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Projects
          </button>
          <button 
            onClick={() => handleNavigate('/services')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Services
          </button>
          <button 
            onClick={() => handleNavigate('/estimates')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Estimates
          </button>
          <button 
            onClick={() => handleNavigate('/warranty')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Warranty
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Using Regular Links</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Home
          </a>
          <a href="/projects" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Projects
          </a>
          <a href="/services" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Services
          </a>
          <a href="/estimates" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Estimates
          </a>
          <a href="/warranty" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Warranty
          </a>
        </div>
      </div>
    </div>
  );
};

export default NavigationTestPage;
