import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  backPath?: string;
  highlightText?: string;
}

const PageHeader = ({ title, subtitle, backPath, highlightText }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-8">
      {backPath && (
        <Button
          onClick={() => navigate(backPath)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      <div className="flex-1 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          {title}{" "}
          {highlightText && (
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              {highlightText}
            </span>
          )}
        </h1>
        <p className="text-lg text-white/80 mt-2">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;
