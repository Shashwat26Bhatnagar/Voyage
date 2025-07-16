import ChromeDinoGame from "react-chrome-dino"

const DinoWrapper = () => {
    return (
        <div>
            <div className="bg-black/70 px-6 py-4 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Building your personalised itinerary...
                </h2>
                <p className="text-sm text-gray-300">Play while we build!</p>
            </div>
            <div className="text-s text-gray-400 mt-2 text-center">
                Tip: Use <span className="font-semibold">↑ Up Arrow</span> or <span className="font-semibold">Spacebar</span> to jump.
            </div>
            
            <div className="scale-[1.5] origin-top">
                <ChromeDinoGame />
            </div>
        </div>
    );
};

export default DinoWrapper;
