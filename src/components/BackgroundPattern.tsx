
const BackgroundPattern = () => {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-300/10 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>
  );
};

export default BackgroundPattern;
