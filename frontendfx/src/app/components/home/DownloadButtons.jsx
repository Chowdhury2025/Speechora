import React from 'react';
import { FaGooglePlay, FaApple, FaDownload } from 'react-icons/fa';

const DownloadButtons = () => {
  return (
    <div className="py-12 bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
          Get Our App
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Download our mobile application for a seamless learning experience on the go.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a
            href="#" // Replace with your Play Store link
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky_blue-600 hover:bg-sky_blue-700 transition-colors duration-200 w-full sm:w-auto"
          >
            <FaGooglePlay className="mr-3 -ml-1 h-6 w-6" />
            Get it on Google Play
          </a>
          <a
            href="#" // Replace with your App Store link
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200 w-full sm:w-auto"
          >
            <FaApple className="mr-3 -ml-1 h-6 w-6" />
            Download on the App Store
          </a>
          <a
            href="https://raw.githubusercontent.com/Jamadrac/webmarkapp/refs/heads/main/build/app/outputs/flutter-apk/app-release.apk" // Replace with your APK download link
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto"
          >
            <FaDownload className="mr-3 -ml-1 h-6 w-6" />
            Download APK
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadButtons;
