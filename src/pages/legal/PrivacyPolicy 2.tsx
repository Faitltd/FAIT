import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-1 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              FAIT Co-Op ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our FAIT Co-Op Platform ("Platform").
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, information we collect automatically when you use the Platform, and information from third-party sources.
            </p>

            <h3>2.1 Information You Provide</h3>
            <p>
              We collect information you provide when you register for an account, complete a transaction, fill out a form, or communicate with us. This may include:
            </p>
            <ul>
              <li>Personal information (name, email address, phone number, etc.)</li>
              <li>Payment information</li>
              <li>Profile information (profile picture, skills, qualifications, etc.)</li>
              <li>Communications and feedback</li>
            </ul>

            <h3>2.2 Information We Collect Automatically</h3>
            <p>
              When you use our Platform, we automatically collect certain information, including:
            </p>
            <ul>
              <li>Device information (IP address, browser type, operating system, etc.)</li>
              <li>Usage information (pages visited, time spent on the Platform, etc.)</li>
              <li>Location information (with your consent)</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Communicate with you about products, services, offers, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Personalize your experience on the Platform</li>
            </ul>

            <h2>4. How We Share Your Information</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul>
              <li>With service agents and clients to facilitate bookings and services</li>
              <li>With service providers who perform services on our behalf</li>
              <li>With third-party payment processors</li>
              <li>In response to legal process or government requests</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a merger, sale, or acquisition</li>
            </ul>

            <h2>5. Your Choices</h2>
            <p>
              You have certain choices about how we use your information:
            </p>
            <ul>
              <li>Account Information: You can update your account information at any time by logging into your account</li>
              <li>Marketing Communications: You can opt out of marketing emails by following the unsubscribe instructions</li>
              <li>Cookies: You can manage cookies through your browser settings</li>
              <li>Location Information: You can control location tracking through your device settings</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              The Platform is not intended for children under the age of 18. We do not knowingly collect information from children under 18.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have different data protection laws.
            </p>

            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@faitcoop.com" className="text-blue-600 hover:text-blue-800">privacy@faitcoop.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
