import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SimpleServiceSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  // Mock service categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'kitchen-remodeling', name: 'Kitchen Remodeling' },
    { id: 'bathroom-remodeling', name: 'Bathroom Remodeling' },
    { id: 'flooring', name: 'Flooring' },
    { id: 'painting', name: 'Painting' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'cleaning', name: 'Cleaning' },
  ];

  // Mock services data
  const mockServices = [
    {
      id: 1,
      title: 'Kitchen Remodeling',
      category: 'kitchen-remodeling',
      description: 'Complete kitchen renovation services including cabinets, countertops, and appliances.',
      price: '$5,000 - $25,000',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 2,
      title: 'Bathroom Renovation',
      category: 'bathroom-remodeling',
      description: 'Transform your bathroom with our professional renovation services.',
      price: '$3,000 - $15,000',
      rating: 4.7,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 3,
      title: 'Hardwood Flooring Installation',
      category: 'flooring',
      description: 'Professional hardwood flooring installation with premium materials.',
      price: '$8 - $15 per sq ft',
      rating: 4.9,
      reviews: 87,
      image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 4,
      title: 'Interior Painting',
      category: 'painting',
      description: 'Professional interior painting services for homes and offices.',
      price: '$2 - $5 per sq ft',
      rating: 4.6,
      reviews: 112,
      image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 5,
      title: 'Electrical Wiring',
      category: 'electrical',
      description: 'Complete electrical wiring and rewiring services by licensed electricians.',
      price: '$75 - $150 per hour',
      rating: 4.8,
      reviews: 76,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 6,
      title: 'Plumbing Repair',
      category: 'plumbing',
      description: 'Professional plumbing repair and installation services.',
      price: '$80 - $120 per hour',
      rating: 4.7,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
  ];

  // Filter services based on search term and category
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredServices = [...mockServices];
      
      if (searchTerm) {
        filteredServices = filteredServices.filter(service => 
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory && selectedCategory !== 'all') {
        filteredServices = filteredServices.filter(service => 
          service.category === selectedCategory
        );
      }
      
      setServices(filteredServices);
      setLoading(false);
    }, 500);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find Home Services
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Browse our selection of professional home services
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Services
              </label>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }}></div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-900 font-medium">{service.price}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-gray-700">{service.rating} ({service.reviews})</span>
                      </div>
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleServiceSearchPage;
