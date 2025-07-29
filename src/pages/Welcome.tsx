import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/VirtuVoyageLogo.jpeg";


const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">

      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-300/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="max-w-3xl mx-auto text-center space-y-8">

          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="VirtuVoyage Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                VirtuVoyage
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-300 font-medium">
              Smart trips. Seamless days
            </p>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto mt-6">
              Create amazing travel experiences with personalized recommendations and intelligent planning.
            </p>
          </div>

          <div className="pt-8">
            <Button
              onClick={() => navigate('/options')}
              size="lg"
              className="px-12 py-6 text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-full border-0"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Planning
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
