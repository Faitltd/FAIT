import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-1 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="prose max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the FAIT Co-Op Platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              The FAIT Co-Op Platform is a marketplace connecting homeowners with service agents for home improvement and maintenance services. The Platform facilitates bookings, payments, messaging, and other related services.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of the Platform, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>

            <h2>4. User Conduct</h2>
            <p>
              You agree not to use the Platform for any illegal or unauthorized purpose. You agree to comply with all local laws regarding online conduct and acceptable content.
            </p>

            <h2>5. Service Agent Services</h2>
            <p>
              Service agents are independent contractors and not employees of FAIT Co-Op. FAIT Co-Op does not guarantee the quality, safety, or legality of services offered by service agents.
            </p>

            <h2>6. Bookings and Payments</h2>
            <p>
              All bookings and payments are processed through the Platform. FAIT Co-Op charges service fees for facilitating transactions between homeowners and service agents.
            </p>

            <h2>7. Cancellation Policy</h2>
            <p>
              Cancellation policies vary by service. Please review the specific cancellation policy before making a booking.
            </p>

            <h2>8. Warranties and Claims</h2>
            <p>
              FAIT Co-Op offers warranty programs for certain services. The terms of these warranties are specified in separate warranty agreements.
            </p>

            <h2>9. Intellectual Property</h2>
            <p>
              All content on the Platform, including text, graphics, logos, and software, is the property of FAIT Co-Op and is protected by copyright and other intellectual property laws.
            </p>

            <h2>10. Privacy</h2>
            <p>
              Your use of the Platform is also governed by our Privacy Policy, which can be found <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800">here</Link>.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              FAIT Co-Op is not liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of the Platform.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless FAIT Co-Op and its affiliates from any claims, damages, or expenses arising from your use of the Platform or your violation of these Terms of Service.
            </p>

            <h2>13. Termination</h2>
            <p>
              FAIT Co-Op reserves the right to terminate or suspend your account and access to the Platform at any time, without notice, for conduct that FAIT Co-Op believes violates these Terms of Service or is harmful to other users of the Platform, FAIT Co-Op, or third parties.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              FAIT Co-Op reserves the right to modify these Terms of Service at any time. We will provide notice of significant changes by posting the new Terms of Service on the Platform.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of the state of [Your State], without regard to its conflict of law provisions.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@faitcoop.com" className="text-blue-600 hover:text-blue-800">support@faitcoop.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
