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
      <h1 className="text-2xl font-bold mb-4">Learning Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">child Plan</h2>
          <p className="text-gray-600 mb-4">Perfect for individual learners</p>
          <ul className="list-disc list-inside mb-4">
            <li>Access to basic courses</li>
            <li>Study materials & notes</li>
            <li>Practice exercises</li>
            <li>Basic progress tracking</li>
          </ul>          <p className="text-2xl font-bold mb-4">K 99/month</p>
          <button 
            onClick={() => handlePaymentClick("Child Plan", 99)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Start Learning
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-sm rounded-bl">
            Popular
          </div>
          <h2 className="text-xl font-semibold mb-2">Premium child</h2>
          <p className="text-gray-600 mb-4">Enhanced learning experience</p>
          <ul className="list-disc list-inside mb-4">
            <li>All basic features</li>
            <li>Live tutoring sessions</li>
            <li>Interactive workshops</li>
            <li>Advanced assessments</li>
            <li>Study group access</li>
          </ul>          <p className="text-2xl font-bold mb-4">K 199/month</p>
          <button 
            onClick={() => handlePaymentClick("Premium Child Plan", 199)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Upgrade Now
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Institution Plan</h2>
          <p className="text-gray-600 mb-4">For schools and organizations</p>
          <ul className="list-disc list-inside mb-4">
            <li>Custom curriculum</li>
            <li>Bulk child enrollment</li>
            <li>Teacher dashboard</li>
            <li>Performance analytics</li>
            <li>24/7 priority support</li>
          </ul>
          <p className="text-2xl font-bold mb-4">Contact us</p>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Request Demo
          </button>        </div>
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
