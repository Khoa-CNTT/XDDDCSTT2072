
import { Link } from "react-router-dom";
const NoFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/home"
        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Go back Home
      </Link>
    </div>
  );
};

export default NoFoundPage;
