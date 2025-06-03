import React from 'react';
import { FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuotationFab = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/quotation')}
      className="fixed bottom-8 right-8 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 z-50 flex items-center justify-center gap-2 group"
      title="Create New Quotation"
    >
      <FilePlus className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
        New Quotation
      </span>
    </button>
  );
};

export default QuotationFab;
