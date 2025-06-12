// import Hero from "./app/home/Hero";

import ProgramsAndApplication from "./app/all_programes";
import DownloadButtons from "./app/components/home/DownloadButtons"; // Added import


export default function Home() {
  return (
    <div>
      <ProgramsAndApplication />
        {/* <Hero/> */}
      <DownloadButtons /> {/* Added component */}
    </div>
  )
}
