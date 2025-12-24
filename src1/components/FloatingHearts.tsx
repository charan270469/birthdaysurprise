import { useEffect, useState } from "react";

interface FloatingHeart {
  id: number;
  left: number;
  delay: number;
  duration: number;
  symbol: string;
  size: number;
  shade: string;
}

const heartSymbols = ["♡", "♥", "❤", "♡", "♡", "♡"];
const pinkShades = [
  "340 82% 65%",   // soft pink
  "350 80% 72%",   // rose pink
  "330 70% 60%",   // deeper pink
  "355 85% 78%",   // light blush
  "345 75% 55%",   // medium pink
];

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    const initialHearts: FloatingHeart[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 8,
      symbol: heartSymbols[Math.floor(Math.random() * heartSymbols.length)],
      size: 14 + Math.random() * 18,
      shade: pinkShades[Math.floor(Math.random() * pinkShades.length)],
    }));
    setHearts(initialHearts);

    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev.slice(-15),
        {
          id: Date.now(),
          left: Math.random() * 100,
          delay: 0,
          duration: 8 + Math.random() * 8,
          symbol: heartSymbols[Math.floor(Math.random() * heartSymbols.length)],
          size: 14 + Math.random() * 18,
          shade: pinkShades[Math.floor(Math.random() * pinkShades.length)],
        },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute animate-float-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
            color: `hsl(${heart.shade})`,
            opacity: 0.5,
          }}
        >
          {heart.symbol}
        </span>
      ))}
    </div>
  );
};

export default FloatingHearts;
