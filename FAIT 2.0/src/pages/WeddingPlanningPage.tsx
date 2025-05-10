import React from 'react';
import { Link } from 'react-router-dom';

const WeddingPlanningPage: React.FC = () => {
  return (
    <div className="wedding-planning-page">
      {/* Header Navigation */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold">
                <span className="text-primary-600" style={{ color: '#d946ef' }}>FAIT</span>
                <span className="text-neutral-900">Co-op</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="#" className="text-neutral-600 hover:text-primary-600">Wedding Websites</Link>
              <Link to="#" className="text-neutral-600 hover:text-primary-600">Invitations</Link>
              <Link to="#" className="text-neutral-600 hover:text-primary-600">Registry</Link>
              <Link to="#" className="text-neutral-600 hover:text-primary-600">Venues</Link>
              <Link to="#" className="text-neutral-600 hover:text-primary-600">Vendors</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="#" className="btn-primary" style={{
                background: 'linear-gradient(to right, #d946ef, #ec4899)',
                color: 'white',
                borderRadius: '25px',
                padding: '10px 20px',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}>Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20" style={{
        background: 'linear-gradient(to right, #d946ef, #ec4899)',
        color: 'white'
      }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Plan Your Perfect Wedding</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">All the tools you need to plan your wedding, all in one place.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="#" className="btn-primary" style={{
              background: 'linear-gradient(to right, #d946ef, #ec4899)',
              color: 'white',
              borderRadius: '25px',
              padding: '10px 20px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}>Create a Wedding Website</Link>
            <Link to="#" className="btn-primary bg-white text-primary-600" style={{
              background: 'white',
              color: '#d946ef',
              borderRadius: '25px',
              padding: '10px 20px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}>Start Your Registry</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl md:text-4xl font-bold mb-6" style={{ color: '#d946ef' }}>Everything You Need</h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">From wedding websites to registries, invitations to guest lists, we've got you covered.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {/* Wedding Website Feature */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold mb-2">Wedding Website</h3>
              <p className="text-gray-600 mb-4">Create a beautiful, mobile-friendly wedding website to share with your guests.</p>
              <Link to="#" className="font-medium hover:underline" style={{ color: '#d946ef' }}>Create Website</Link>
            </div>

            {/* Invitations Feature */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold mb-2">Invitations</h3>
              <p className="text-gray-600 mb-4">Design and send beautiful digital or paper invitations for your big day.</p>
              <Link to="#" className="font-medium hover:underline" style={{ color: '#d946ef' }}>Browse Invitations</Link>
            </div>

            {/* Registry Feature */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold mb-2">Registry</h3>
              <p className="text-gray-600 mb-4">Create a registry with gifts from any store, cash funds, and experiences.</p>
              <Link to="#" className="font-medium hover:underline" style={{ color: '#d946ef' }}>Start Registry</Link>
            </div>

            {/* Guest List Feature */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:-translate-y-2">
              <h3 className="text-xl font-semibold mb-2">Guest List</h3>
              <p className="text-gray-600 mb-4">Manage your guest list, track RSVPs, and organize seating arrangements.</p>
              <Link to="#" className="font-medium hover:underline" style={{ color: '#d946ef' }}>Manage Guests</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Website Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-2xl md:text-4xl font-bold mb-6" style={{ color: '#d946ef' }}>Beautiful Wedding Websites</h2>
              <p className="text-gray-600 mb-6">Share your love story, wedding details, and registry with your guests through a personalized wedding website.</p>
              <ul className="space-y-4 mb-8">
                <li>Customizable designs to match your wedding style</li>
                <li>Mobile-friendly for guests on the go</li>
                <li>RSVP management and guest tracking</li>
              </ul>
              <Link to="#" className="btn-primary" style={{
                background: 'linear-gradient(to right, #d946ef, #ec4899)',
                color: 'white',
                borderRadius: '25px',
                padding: '10px 20px',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}>Create Your Website</Link>
            </div>
            <div className="md:w-1/2">
              <img src="https://via.placeholder.com/600x400" alt="Wedding Website Example" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Registry Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pl-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-6" style={{ color: '#d946ef' }}>The Perfect Registry</h2>
              <p className="text-gray-600 mb-6">Create a registry that's as unique as you are, with gifts from any store, cash funds, and experiences.</p>
              <ul className="space-y-4 mb-8">
                <li>Add gifts from any store or website</li>
                <li>Create cash funds for honeymoon, home, and more</li>
                <li>Group gifting for big-ticket items</li>
              </ul>
              <Link to="#" className="btn-primary" style={{
                background: 'linear-gradient(to right, #d946ef, #ec4899)',
                color: 'white',
                borderRadius: '25px',
                padding: '10px 20px',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}>Start Your Registry</Link>
            </div>
            <div className="md:w-1/2">
              <img src="https://via.placeholder.com/600x400" alt="Wedding Registry Example" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl md:text-4xl font-bold mb-6" style={{ color: '#d946ef' }}>What Couples Say</h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">Hear from couples who planned their perfect wedding with us.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <h4 className="font-semibold">Jessica & Michael</h4>
                <p className="text-gray-500 text-sm">Married June 2023</p>
              </div>
              <p className="text-gray-600">"The wedding website was so easy to create and our guests loved it! The registry was perfect for us since we already had most household items."</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <h4 className="font-semibold">Alex & Taylor</h4>
                <p className="text-gray-500 text-sm">Married September 2023</p>
              </div>
              <p className="text-gray-600">"The guest list management tool saved us so much time and stress. We could easily track RSVPs and meal preferences all in one place."</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <h4 className="font-semibold">Sophia & James</h4>
                <p className="text-gray-500 text-sm">Married August 2023</p>
              </div>
              <p className="text-gray-600">"The digital invitations were beautiful and saved us money on printing and postage. Plus, we could easily track who had opened them."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{
        background: 'linear-gradient(to right, #d946ef, #ec4899)',
        color: 'white'
      }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Planning Your Dream Wedding Today</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">Join thousands of couples who have planned their perfect wedding with our all-in-one platform.</p>
          <Link to="#" className="btn-primary bg-white text-primary-600" style={{
            background: 'white',
            color: '#d946ef',
            borderRadius: '25px',
            padding: '10px 20px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}>Sign Up Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Press</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>

            {/* Planning Tools */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Planning Tools</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Wedding Website</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Registry</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Guest List</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Invitations</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Wedding Checklist</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Budget Planner</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Vendor Directory</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Wedding Blog</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Accessibility</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} FAIT Co-op. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeddingPlanningPage;
