
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border">
        <h1 className="text-4xl font-bold text-firmware-blue-600 mb-4">404</h1>
        <div className="h-16 w-16 mx-auto mb-4 bg-firmware-blue-50 rounded-full flex items-center justify-center">
          <div className="h-10 w-10 text-firmware-blue-600 flex items-center justify-center text-lg font-bold">
            F
          </div>
        </div>
        <p className="text-xl font-medium text-firmware-gray-900 mb-2">Page not found</p>
        <p className="text-firmware-gray-500 mb-6">
          The firmware file you're looking for doesn't exist or has been moved to another location.
        </p>
        <Button asChild className="gap-2">
          <Link to="/">
            <ChevronLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
