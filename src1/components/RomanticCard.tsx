import { useState, useEffect, useRef } from "react";
import Confetti from "./Confetti";
import BasketballGame from "./BasketballGame";
import BirthdayReveal from "./BirthdayReveal";
import audioFile from "@/audio/Adi Enti Okkasari - Nee La Yevaru.mp3";

type Stage = "greeting" | "special" | "audio" | "question" | "reveal" | "game" | "birthday";

const RomanticCard = () => {
  const [stage, setStage] = useState<Stage>("greeting");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonEscaping, setNoButtonEscaping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      transitionTo("special");
    }, 2000);

    const timer2 = setTimeout(() => {
      transitionTo("audio");
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Ensure audio continues playing when transitioning to birthday stage
  useEffect(() => {
    if (stage === "birthday" && audioRef.current && isPlaying) {
      // Ensure audio is still playing
      if (audioRef.current.paused) {
        audioRef.current.play().catch((error) => {
          console.error("Error resuming audio:", error);
        });
      }
    }
  }, [stage, isPlaying]);

  const transitionTo = (newStage: Stage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStage(newStage);
      setIsTransitioning(false);
    }, 400);
  };

  const handleYesClick = () => {
    setShowConfetti(true);
    transitionTo("reveal");
    
    // After showing the reveal message, transition to game
    setTimeout(() => {
      setShowConfetti(false);
      transitionTo("game");
    }, 3000);
  };

  const handleGameComplete = () => {
    transitionTo("birthday");
  };

  const handleNoHover = () => {
    if (!noButtonEscaping) {
      setNoButtonEscaping(true);
      escapeButton();
    }
  };

  const escapeButton = () => {
    const maxX = 150;
    const maxY = 100;
    const newX = (Math.random() - 0.5) * maxX * 2;
    const newY = (Math.random() - 0.5) * maxY * 2;
    setNoButtonPosition({ x: newX, y: newY });
    
    setTimeout(() => {
      setNoButtonEscaping(false);
    }, 300);
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setIsPlaying(true);
      
      // Transition to question after audio starts playing
      setTimeout(() => {
        transitionTo("question");
      }, 500);
    }
  };

  const renderContent = () => {
    switch (stage) {
      case "greeting":
        return (
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-semibold text-card-foreground animate-bounce-soft">
              Hey 👀💗
            </p>
          </div>
        );

      case "special":
        return (
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-card-foreground leading-relaxed">
              It's Your Special Day Today! 🎉💖
            </p>
          </div>
        );

      case "audio":
        return (
          <div className="text-center space-y-8">
            <p className="text-2xl md:text-3xl font-semibold text-card-foreground">
              Play Your Audio 🎵💖
            </p>
            <div className="flex justify-center items-center">
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className="
                  bg-[#ff69b4]
                  hover:bg-[#ff1493]
                  text-white
                  font-semibold
                  rounded-full
                  w-20
                  h-20
                  md:w-24
                  md:h-24
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  ease-out
                  hover:scale-110
                  hover:shadow-lg
                  disabled:opacity-70
                  disabled:cursor-not-allowed
                  animate-pulse-glow
                  shadow-lg
                "
                style={{
                  boxShadow: "0 4px 20px rgba(255, 105, 180, 0.4)",
                }}
              >
                {isPlaying ? (
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        );

      case "question":
        return (
          <div className="text-center space-y-8">
            <p className="text-2xl md:text-3xl font-semibold text-card-foreground">
              Do you wanna see what I made? ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative min-h-[60px]">
              <button
                onClick={handleYesClick}
                className="btn-yes text-lg animate-pulse-glow"
              >
                Yes 💕
              </button>
              <button
                onMouseEnter={handleNoHover}
                onClick={handleNoHover}
                className="btn-no text-lg transition-transform duration-200"
                style={{
                  transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                }}
              >
                No 🙄
              </button>
            </div>
          </div>
        );

      case "reveal":
        return (
          <div className="text-center space-y-4">
            <p className="text-2xl md:text-4xl font-bold text-card-foreground leading-relaxed animate-wiggle">
              This website is made just for you 💖🥹
            </p>
            <p className="text-lg text-muted-foreground">
              But first... a little game! 🏀
            </p>
            <div className="flex justify-center gap-2 text-3xl pt-4">
              <span className="animate-bounce" style={{ animationDelay: "0s" }}>💕</span>
              <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>✨</span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>🦋</span>
              <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>💖</span>
              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>🌸</span>
            </div>
          </div>
        );

      case "game":
        return <BasketballGame onComplete={handleGameComplete} />;

      case "birthday":
        return <BirthdayReveal />;

      default:
        return null;
    }
  };

  return (
    <>
      <Confetti active={showConfetti} />
      <audio
        ref={audioRef}
        src={audioFile}
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      {stage === "birthday" ? (
        renderContent()
      ) : (
        <div
          ref={cardRef}
          className={`
            ${stage === "game" ? "" : "romantic-card bg-card"}
            rounded-2xl
            p-8 md:p-12
            ${stage === "game" ? "max-w-lg" : "max-w-md md:max-w-lg"}
            w-[90vw]
            mx-auto
            transform
            transition-all
            duration-500
            ease-out
            ${isTransitioning ? "animate-fade-out-down opacity-0" : "animate-fade-in-up"}
          `}
        >
          {renderContent()}
        </div>
      )}
    </>
  );
};

export default RomanticCard;
