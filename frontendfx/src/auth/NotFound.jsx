import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from "react-router-dom";
import { colorGuide, componentStyles } from '../theme/colors';

function NotFound() {
  return (
    <div className={`flex flex-col items-center justify-center h-screen ${colorGuide.neutral.bgPage} p-4`}>
      <h1 className={`text-4xl font-bold ${colorGuide.neutral.textPrimary}`}>
        404 - Page Not Found
      </h1>
      
      <div className="w-64 h-64">
        <DotLottieReact
          src="https://lottie.host/1faeff44-b8de-4bc1-acb3-00b50918c5a9/E9PRXSnU2G.lottie"
          loop
          autoplay
        />
      </div>

      <p className={`mt-2 ${colorGuide.neutral.textSecondary}`}>
        The page you are looking for does not exist.
      </p>
      
      <Link 
        to="/" 
        className={`mt-4 px-4 py-2 rounded ${componentStyles.button.primary}`}
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
