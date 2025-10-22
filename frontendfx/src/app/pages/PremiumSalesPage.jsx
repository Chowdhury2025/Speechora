 import React, { useState } from "react";
import PaymentPopup from "../components/payments/PaymentPopup";

const PremiumSalesPage = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePaymentClick = (plan, amount) => {
    setSelectedPlan({ name: plan, amount });
    setIsPaymentOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#3C3C3C] mb-8">Learning Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-slate-100 hover:border-[#58cc02] transition-colors duration-200">
          <h2 className="text-xl font-bold text-[#3C3C3C] mb-2">Child Plan</h2>
          <p className="text-[#4b4b4b] mb-4">Perfect for individual learners</p>
          <ul className="space-y-3 mb-6">
            {["Access to basic courses", "Study materials & notes", "Practice exercises", "Basic progress tracking"].map((item) => (
              <li key={item} className="flex items-center text-[#4b4b4b]">
                <svg className="w-5 h-5 text-[#58cc02] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-2xl font-bold text-[#3C3C3C] mb-4">K 99/month</p>
          <button 
            onClick={() => handlePaymentClick("Child Plan", 99)}
            className="w-full bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
          >
            Start Learning
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative bg-white rounded-2xl shadow-md p-6 border-2 border-[#1cb0f6] hover:border-[#58cc02] transition-colors duration-200">
          <div className="absolute -top-4 right-4 bg-[#1cb0f6] text-white px-4 py-1 text-sm font-bold rounded-full">
            Popular
          </div>
          <h2 className="text-xl font-bold text-[#3C3C3C] mb-2">Premium Child</h2>
          <p className="text-[#4b4b4b] mb-4">Enhanced learning experience</p>
          <ul className="space-y-3 mb-6">
            {["All basic features", "Live tutoring sessions", "Interactive workshops", "Advanced assessments", "Study group access"].map((item) => (
              <li key={item} className="flex items-center text-[#4b4b4b]">
                <svg className="w-5 h-5 text-[#1cb0f6] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-2xl font-bold text-[#3C3C3C] mb-4">K 199/month</p>
          <button 
            onClick={() => handlePaymentClick("Premium Child Plan", 199)}
            className="w-full bg-[#1cb0f6] hover:bg-[#0095e0] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#1899d6] hover:border-[#0076b8] focus:outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:ring-offset-2"
          >
            Upgrade Now
          </button>
        </div>

        {/* Institution Plan */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-slate-100 hover:border-[#58cc02] transition-colors duration-200">
          <h2 className="text-xl font-bold text-[#3C3C3C] mb-2">Institution Plan</h2>
          <p className="text-[#4b4b4b] mb-4">For schools and organizations</p>
          <ul className="space-y-3 mb-6">
            {["Custom curriculum", "Bulk child enrollment", "Teacher dashboard", "Performance analytics", "24/7 priority support"].map((item) => (
              <li key={item} className="flex items-center text-[#4b4b4b]">
                <svg className="w-5 h-5 text-[#58cc02] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-2xl font-bold text-[#3C3C3C] mb-4">Contact us</p>
          <button 
            className="w-full bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
          >
            Request Demo
          </button>
        </div>
      </div>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={selectedPlan?.amount}
        planName={selectedPlan?.name}
      />
    </div>
  );
};

export default PremiumSalesPage;
