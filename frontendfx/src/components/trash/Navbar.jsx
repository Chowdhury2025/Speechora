import React from 'react';

const EpicInstituteHeader = () => {
  return (
    <div>
      {/* First Top Bar - Contact and Timing */}
      <div className="bg-gray-900 text-white py-2 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>076-767-7017</span>
          <span>epicinstituteof@gmail.com</span>
          <span>Opening: 08:00am - 5:00pm</span>
        </div>
      </div>

      {/* Second Bar - Contact Action Buttons */}
      <div className="bg-white border-y py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/api/placeholder/50/50" 
            alt="Epic Institute Logo" 
            className="h-12 w-12 mr-3 rounded-full"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <a href="tel:+260786157106">Call Now</a>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <a href="mailto:epicinstituteof@gmail.com">Send Message</a>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 10-8 10s-8-4-8-10a8 8 0 1 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Lot 923m, Kasama Road, Lusaka</span>
          </div>
        </div>
      </div>

      {/* Third Bar - Navigation Menu */}
      <div className="bg-white border-b py-3 px-4">
        <nav>
          <ul className="flex justify-center space-x-6">
            {['HOME', 'OUR PROGRAMMES', 'childS', 'CAREERS', 'COURSES', 'BLOGS', 'CONTACT'].map((item) => (
              <li key={item} className="text-gray-700 hover:text-green-600 transition">
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default EpicInstituteHeader;