import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="mt-1 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              This Cookie Policy explains how FAIT Co-Op ("we", "our", or "us") uses cookies and similar technologies on our FAIT Co-Op Platform ("Platform"). This policy should be read alongside our <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>, which explains how we use personal information.
            </p>

            <h2>2. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>

            <h2>3. How We Use Cookies</h2>
            <p>
              We use cookies for the following purposes:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> These cookies are necessary for the Platform to function properly. They enable core functionality such as security, network management, and account access.</li>
              <li><strong>Functionality Cookies:</strong> These cookies allow us to remember choices you make and provide enhanced, personalized features.</li>
              <li><strong>Performance Cookies:</strong> These cookies collect information about how you use the Platform, such as which pages you visit most often. They help us improve how the Platform works.</li>
              <li><strong>Analytics Cookies:</strong> These cookies allow us to recognize and count the number of visitors and see how visitors move around the Platform. This helps us improve the way the Platform works.</li>
              <li><strong>Advertising Cookies:</strong> These cookies are used to deliver advertisements that are relevant to you and your interests.</li>
            </ul>

            <h2>4. Types of Cookies We Use</h2>
            <h3>4.1 First-Party Cookies</h3>
            <p>
              First-party cookies are set by us and are necessary for the Platform to function properly.
            </p>

            <h3>4.2 Third-Party Cookies</h3>
            <p>
              Third-party cookies are set by our partners and service providers. These include analytics providers, advertising networks, and social media platforms.
            </p>

            <h2>5. Specific Cookies We Use</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cookie Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">session</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Authentication</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Session</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_ga</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 years</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_gid</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24 hours</td>
                </tr>
              </tbody>
            </table>

            <h2>6. Managing Cookies</h2>
            <p>
              Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The following links provide information on how to modify your cookie settings in different browsers:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Microsoft Edge</a></li>
            </ul>
            <p>
              Please note that if you choose to block cookies, you may not be able to use all the features of the Platform.
            </p>

            <h2>7. Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Cookie Policy, please contact us at <a href="mailto:privacy@faitcoop.com" className="text-blue-600 hover:text-blue-800">privacy@faitcoop.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
