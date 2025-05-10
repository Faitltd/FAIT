import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, FileText, Bell } from 'lucide-react';

const ForumPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
        <div className="flex space-x-2">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome to the FAIT Community Forum</h2>
        <p className="text-blue-700 mb-4">
          Connect with other contractors, clients, and service providers. Share knowledge, ask questions, and build relationships.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/forum/guidelines"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Forum Guidelines
          </Link>
          <Link
            to="/forum/faq"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            FAQ
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Forum Categories</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Category 1 */}
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-md font-medium text-gray-900">
                      <Link to="/forum/general" className="hover:text-blue-600">General Discussion</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      General discussions about home improvement, renovations, and the FAIT platform.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>24 threads</span>
                      <span className="mx-2">•</span>
                      <span>142 posts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category 2 */}
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-md font-medium text-gray-900">
                      <Link to="/forum/contractors" className="hover:text-blue-600">Contractor Corner</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      A place for contractors to discuss techniques, tools, and business practices.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>18 threads</span>
                      <span className="mx-2">•</span>
                      <span>97 posts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category 3 */}
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FileText className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-md font-medium text-gray-900">
                      <Link to="/forum/projects" className="hover:text-blue-600">Project Showcase</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Share your completed projects and get feedback from the community.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>32 threads</span>
                      <span className="mx-2">•</span>
                      <span>215 posts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category 4 */}
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Bell className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-md font-medium text-gray-900">
                      <Link to="/forum/announcements" className="hover:text-blue-600">Announcements</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Official announcements from the FAIT team about platform updates and features.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>8 threads</span>
                      <span className="mx-2">•</span>
                      <span>42 posts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Categories:</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Threads:</span>
                <span className="font-medium">82</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Posts:</span>
                <span className="font-medium">496</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Members:</span>
                <span className="font-medium">245</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/forum/recent"
                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Recent Discussions
              </Link>
              <Link
                to="/forum/popular"
                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Popular Threads
              </Link>
              <Link
                to="/forum/unanswered"
                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Unanswered Questions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
