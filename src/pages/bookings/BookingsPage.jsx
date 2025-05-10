import React, { useState } from 'react';

const BookingsPage = () => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceType: '',
    date: '',
    time: '',
    address: '',
    specialInstructions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', bookingData);
    setStep(4); // Move to confirmation step
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Book a Service</h1>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}>
              1
            </div>
            <span className="text-sm mt-1">Service</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}>
              2
            </div>
            <span className="text-sm mt-1">Schedule</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}>
              3
            </div>
            <span className="text-sm mt-1">Details</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Service</h2>
              <p className="text-gray-600 mb-6">
                Choose the type of service you need.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="handyman"
                    name="serviceType"
                    type="radio"
                    value="handyman"
                    checked={bookingData.serviceType === 'handyman'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="handyman" className="ml-3 block text-sm font-medium text-gray-700">
                    Handyman Services
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="remodeling"
                    name="serviceType"
                    type="radio"
                    value="remodeling"
                    checked={bookingData.serviceType === 'remodeling'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="remodeling" className="ml-3 block text-sm font-medium text-gray-700">
                    Remodeling
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="plumbing"
                    name="serviceType"
                    type="radio"
                    value="plumbing"
                    checked={bookingData.serviceType === 'plumbing'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="plumbing" className="ml-3 block text-sm font-medium text-gray-700">
                    Plumbing
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="electrical"
                    name="serviceType"
                    type="radio"
                    value="electrical"
                    checked={bookingData.serviceType === 'electrical'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="electrical" className="ml-3 block text-sm font-medium text-gray-700">
                    Electrical
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!bookingData.serviceType}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!bookingData.serviceType ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule Your Appointment</h2>
              <p className="text-gray-600 mb-6">
                Select a date and time for your service.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                  <select
                    id="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!bookingData.date || !bookingData.time}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(!bookingData.date || !bookingData.time) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Details</h2>
              <p className="text-gray-600 mb-6">
                Provide additional details for your service.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Service Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={bookingData.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700">Special Instructions</label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    rows="4"
                    value={bookingData.specialInstructions}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special instructions or details about the service needed..."
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!bookingData.address}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!bookingData.address ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Book Now
                </button>
              </div>
            </form>
          )}
          
          {step === 4 && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-gray-900">Booking Confirmed!</h2>
              <p className="mt-2 text-gray-600">
                Your booking for {bookingData.serviceType} service on {bookingData.date} at {bookingData.time} has been confirmed.
              </p>
              <p className="mt-1 text-gray-600">
                A confirmation email has been sent to your registered email address.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
