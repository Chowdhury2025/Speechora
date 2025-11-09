import React from 'react';
import { Link } from 'react-router-dom';
import LandingPageNavbar from '../components/home/LandingPageNavbar';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <LandingPageNavbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-8 text-center">
            Speechora Privacy Policy
          </h1>

          <div className="text-slate-600 space-y-6">
            <div className="text-center mb-8">
              <p className="text-lg italic">Effective Date: 7th November 2025</p>
              <p className="text-lg italic">Last Updated: 7th November 2025</p>
            </div>

            <p className="text-base leading-relaxed">
              Speechora ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard information when you use our Speechora mobile application ("App").
            </p>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">1. Who Uses Speechora</h2>
              <p className="text-base leading-relaxed">
                Speechora is designed for children with autism and communication challenges. However, a parent, guardian, or teacher must create and manage the account before a child can use the app.
              </p>
              <p className="text-base leading-relaxed mt-2">
                Children use the app under adult supervision only.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">2. Information We Collect</h2>
              <p className="text-base leading-relaxed">
                We collect limited information to enable app functionality and provide a better experience.
              </p>

              <h3 className="text-xl font-semibold text-slate-700 mt-4 mb-2">a. Information Provided by Parents/Guardians</h3>
              <p className="text-base leading-relaxed">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Mobile number</li>
                <li>Country</li>
                <li>Approximate (coarse) location — city or region (no precise GPS or background tracking)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mt-4 mb-2">b. Information About the Child Profile</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>A nickname or first name chosen by the parent (optional)</li>
                <li>Age group (e.g., 3–5, 6–8)</li>
                <li>Avatar or image selected by the parent</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mt-4 mb-2">c. Automatically Collected Information</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Device type, operating system, and app version</li>
                <li>In-app usage statistics (non-personal)</li>
                <li>Crash logs and diagnostics</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mt-4 mb-2">d. Payment Information</h3>
              <p className="text-base leading-relaxed">
                When you purchase a subscription, payments are processed securely through Google Play Billing.
              </p>
              <p className="text-base leading-relaxed mt-2">
                Speechora does not store credit or debit card details.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">3. How We Use Information</h2>
              <p className="text-base leading-relaxed">
                We use collected data to:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Create and manage parent accounts</li>
                <li>Personalize the app experience (e.g., language, region)</li>
                <li>Provide customer support and service updates</li>
                <li>Analyze app performance to improve features</li>
                <li>Process subscriptions and maintain access control</li>
              </ul>
              <p className="text-base leading-relaxed mt-4">
                We do not:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Show ads to children</li>
                <li>Sell or share data for marketing or advertising</li>
                <li>Collect personal data directly from children</li>
              </ul>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">4. Children's Privacy</h2>
              <p className="text-base leading-relaxed">
                Speechora complies with the Google Play Families Policy and the Children's Online Privacy Protection Act (COPPA).
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Children do not create accounts or provide personal information.</li>
                <li>All data collection and consent come only from the parent/guardian.</li>
                <li>No external links, ads, or social media features are shown to children.</li>
                <li>Speechora's child interface is designed to prevent data entry by children.</li>
              </ul>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">5. Data Storage and Security</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>All information is transmitted over secure (HTTPS) connections.</li>
                <li>Data stored in the cloud is encrypted at rest.</li>
                <li>We use strict access controls and monitoring to prevent unauthorized access.</li>
                <li>Local data (like app progress) may be stored on the device for offline use.</li>
              </ul>
              <p className="text-base leading-relaxed mt-4">
                We retain account information as long as necessary to provide services or comply with legal obligations. When no longer needed, data is deleted or anonymized.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">6. Parental Rights and Controls</h2>
              <p className="text-base leading-relaxed">
                Parents and guardians can:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access, edit, or delete account information</li>
                <li>Delete child profiles</li>
                <li>Request account or data deletion</li>
                <li>Manage permissions (microphone, storage, analytics) in device settings</li>
              </ul>
              <p className="text-base leading-relaxed mt-4">
                To make a request, contact us at support@speechora.com.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">7. Third-Party Services</h2>
              <p className="text-base leading-relaxed">
                Speechora uses only essential third-party services:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Google Play Billing – for subscriptions</li>
                <li>Text-to-Speech (TTS) – for voice output</li>
                <li>Analytics (child-safe mode) – for performance insights only</li>
              </ul>
              <p className="text-base leading-relaxed mt-4">
                All third-party tools are configured to disable personalized advertising and comply with child privacy standards.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">8. International Users</h2>
              <p className="text-base leading-relaxed">
                If you use Speechora outside your home country, your information may be processed in other regions where we or our partners operate. We follow international privacy principles to protect your data everywhere.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">9. Your Consent</h2>
              <p className="text-base leading-relaxed">
                By creating an account and using Speechora, the parent or guardian provides consent to collect and process information as described in this Privacy Policy.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">10. Policy Updates</h2>
              <p className="text-base leading-relaxed">
                We may update this Privacy Policy from time to time. Updates will be posted within the app or on our website, showing the new effective date.
              </p>
            </div>

            <hr className="border-slate-300" />

            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">11. Contact Us</h2>
              <p className="text-base leading-relaxed">
                If you have any questions, concerns, or data requests, please contact us:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-700">Speechora Support</p>
                <p className="text-slate-600">Email: support@speechora.com</p>
                <p className="text-slate-600">Website: www.speechora.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-block bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 shadow-button hover:shadow-xl transform hover:-translate-y-1"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;