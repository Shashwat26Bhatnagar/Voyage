
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Options = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-300/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-12">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Choose Your
              <span className="block bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Adventure
              </span>
            </h1>
            <p className="text-lg text-white/80 mt-2">
              How would you like to explore?
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Your Own Trip */}
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-black/40 backdrop-blur-md border border-green-500/20 hover:border-green-400/40">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <MapPin className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Plan Your Own Trip</h2>
                  <p className="text-gray-300">
                    Create a personalized itinerary with your preferred destinations and schedule
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/planner')}
                  size="lg"
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-300 shadow-xl rounded-lg border-0"
                >
                  Start Planning
                </Button>
              </CardContent>
            </Card>

            {/* Take a Virtual Tour */}
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-black/40 backdrop-blur-md border border-green-500/20 hover:border-green-400/40">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Take a Virtual Tour</h2>
                  <p className="text-gray-300">
                    Explore destinations virtually with AI-guided tours and recommendations
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/virtual-tour')}
                  size="lg"
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 shadow-xl rounded-lg border-0"
                >
                  Start Tour
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
