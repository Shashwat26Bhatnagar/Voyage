
import { Loader } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay = ({ isVisible, message = "Loading..." }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black/80 rounded-lg p-6 flex flex-col items-center space-y-4">
        <Loader className="w-8 h-8 text-green-400 animate-spin" />
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
