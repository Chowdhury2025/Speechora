// import Hero from "./app/home/Hero";

import ProgramsAndApplication from "./app/all_programes";
import DownloadButtons from "./app/components/home/DownloadButtons"; // Added import
import LandingPageNavbar from "./app/components/home/LandingPageNavbar"; // Added import


export default function Home() {
  return (
    <div className="min-h-screen bg-duo-gray-100 font-sans">
      <LandingPageNavbar />
      <main className="flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-5xl font-extrabold text-duo-green-600 mb-4 text-center drop-shadow-lg">
          Welcome to book8
        </h1>
        <p className="text-xl text-duo-gray-700 mb-8 text-center max-w-2xl">
          The easiest way to learn, practice, and master new skills. Join thousands of learners and start your journey today!
        </p>
        <a href="/register" className="inline-block bg-duo-green-500 hover:bg-duo-green-600 text-duo-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-colors mb-8">
          Get Started
        </a>
        <DownloadButtons />
      </main>
    </div>
  )
}
