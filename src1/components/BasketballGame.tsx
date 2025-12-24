import { useState, useRef, useCallback, useEffect } from "react";

interface BasketballGameProps {
  onComplete: () => void;
}

const BasketballGame = ({ onComplete }: BasketballGameProps) => {
  const [score, setScore] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 50, y: 300 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [isAiming, setIsAiming] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [isFlying, setIsFlying] = useState(false);
  const [message, setMessage] = useState("");
  const [rotation, setRotation] = useState(0);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const hasScored = useRef(false);

  // Game constants
  const GAME_WIDTH = 350;
  const GAME_HEIGHT = 450;
  const BALL_SIZE = 40;
  const HOOP_X = 210;
  const HOOP_Y = 100;
  const HOOP_WIDTH = 90;
  const HOOP_INNER = 65;
  const RIM_THICKNESS = 1;
  const REQUIRED_SCORE = 5;
  const BALL_START_X = 50;
  const BALL_START_Y = 320;
  const GRAVITY = 0.35;
  const [passedThroughHoop, setPassedThroughHoop] = useState(false);

  // Get random ball position within bounds
  const getRandomBallPosition = useCallback(() => {
    const minX = 30;
    const maxX = 150;
    const minY = 280;
    const maxY = 350;
    return {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY
    };
  }, []);

  const resetBall = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    const newPos = getRandomBallPosition();
    setBallPos(newPos);
    setBallVel({ x: 0, y: 0 });
    setIsFlying(false);
    setRotation(0);
    hasScored.current = false;
    setPassedThroughHoop(false);
  }, [getRandomBallPosition]);

  const getClientPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    if ('clientX' in e) {
      return { x: e.clientX, y: e.clientY };
    }
    return { x: 0, y: 0 };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFlying) return;
    e.preventDefault();
    const pos = getClientPos(e);
    setIsAiming(true);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isAiming) return;
    e.preventDefault();
    const pos = getClientPos(e);
    setDragCurrent(pos);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isAiming || isFlying) {
      setIsAiming(false);
      return;
    }
    
    e.preventDefault();
    setIsAiming(false);

    // Calculate swipe vector (swipe UP to shoot)
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragStart.y - dragCurrent.y; // Inverted: swipe up = positive

    const swipeDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (swipeDistance < 30 || dy < 20) {
      // Not enough power or wrong direction
      return;
    }

    // Calculate velocity based on swipe
    const power = Math.min(swipeDistance / 8, 18);
    const angle = Math.atan2(dy, dx);
    
    // Adjust to shoot towards hoop (upper right)
    const velX = Math.cos(angle) * power * 0.7 + 3;
    const velY = -Math.abs(Math.sin(angle) * power) - 2;

    setBallVel({ x: velX, y: velY });
    setIsFlying(true);
    hasScored.current = false;
  };

  // Animation loop
  useEffect(() => {
    if (!isFlying) return;

    let posX = ballPos.x;
    let posY = ballPos.y;
    let velX = ballVel.x;
    let velY = ballVel.y;
    let rot = rotation;

    const animate = () => {
      // Apply gravity
      velY += GRAVITY;
      
      // Update position
      posX += velX;
      posY += velY;
      
      // Spin the ball
      rot += velX * 2;
      
      setBallPos({ x: posX, y: posY });
      setRotation(rot);

      // Ball center
      const ballCenterX = posX + BALL_SIZE / 2;
      const ballCenterY = posY + BALL_SIZE / 2;
      
      // Hoop detection zone - ball must pass through the rim opening
      const hoopLeftEdge = HOOP_X + RIM_THICKNESS + 5;
      const hoopRightEdge = HOOP_X + HOOP_INNER - 5;
      const hoopCenterY = HOOP_Y + 10;

      // Check if ball is entering the hoop area from above
      const isInHoopXRange = ballCenterX > hoopLeftEdge && ballCenterX < hoopRightEdge;
      const isBallNearHoopY = Math.abs(ballCenterY - hoopCenterY) < 20;
      const isBallGoingDown = velY > 0;

      // Score when ball passes through the hoop center going downward
      if (!hasScored.current && 
          isBallGoingDown &&
          isInHoopXRange && 
          isBallNearHoopY &&
          ballCenterY > hoopCenterY - 5 && 
          ballCenterY < hoopCenterY + 30) {
        
        hasScored.current = true;
        setPassedThroughHoop(true);
        const newScore = score + 1;
        setScore(newScore);
        setMessage("Nice! 🏀");
        
        setTimeout(() => setMessage(""), 1200);
        
        if (newScore >= REQUIRED_SCORE) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else {
          setTimeout(resetBall, 1200);
        }
      }

      // Only apply collisions if ball hasn't scored (allow smooth pass through when scored)
      if (!hasScored.current) {
        // Backboard collision
        const backboardX = HOOP_X + HOOP_WIDTH - 5;
        const backboardTop = HOOP_Y - 45;
        const backboardBottom = HOOP_Y + 50;
        
        if (ballCenterX > backboardX - 5 && 
            ballCenterX < backboardX + 15 &&
            ballCenterY > backboardTop && 
            ballCenterY < backboardBottom) {
          velX = -velX * 0.5;
          posX = backboardX - BALL_SIZE / 2 - 5;
        }

        // Rim collision (left side)
        const rimLeftX = HOOP_X + RIM_THICKNESS / 2;
        const rimY = HOOP_Y + 8;
        const distToLeftRim = Math.sqrt(
          Math.pow(ballCenterX - rimLeftX, 2) + 
          Math.pow(ballCenterY - rimY, 2)
        );
        
        if (distToLeftRim < BALL_SIZE / 2 + RIM_THICKNESS / 2) {
          velX = Math.abs(velX) * 0.4;
          velY = -velY * 0.3;
        }

        // Rim collision (right side)
        const rimRightX = HOOP_X + HOOP_INNER - RIM_THICKNESS / 2;
        const distToRightRim = Math.sqrt(
          Math.pow(ballCenterX - rimRightX, 2) + 
          Math.pow(ballCenterY - rimY, 2)
        );
        
        if (distToRightRim < BALL_SIZE / 2 + RIM_THICKNESS / 2) {
          velX = -Math.abs(velX) * 0.4;
          velY = -velY * 0.3;
        }
      }

      // Out of bounds check
      if (posY > GAME_HEIGHT + 50 || posX > GAME_WIDTH + 50 || posX < -100) {
        if (!hasScored.current) {
          setMessage("Miss! Try again 💪");
          setTimeout(() => setMessage(""), 1000);
        }
        setTimeout(resetBall, 600);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFlying]);

  // Calculate trajectory preview
  const getTrajectoryPoints = () => {
    if (!isAiming) return [];
    
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragStart.y - dragCurrent.y;
    const swipeDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (swipeDistance < 30 || dy < 20) return [];

    const power = Math.min(swipeDistance / 8, 18);
    const angle = Math.atan2(dy, dx);
    
    const velX = Math.cos(angle) * power * 0.7 + 3;
    const velY = -Math.abs(Math.sin(angle) * power) - 2;

    const points: { x: number; y: number }[] = [];
    let px = ballPos.x + BALL_SIZE / 2;
    let py = ballPos.y + BALL_SIZE / 2;
    let vx = velX;
    let vy = velY;

    for (let i = 0; i < 30; i++) {
      vy += GRAVITY;
      px += vx;
      py += vy;
      
      if (py > GAME_HEIGHT || px > GAME_WIDTH || px < 0) break;
      
      points.push({ x: px, y: py });
    }

    return points;
  };

  const trajectoryPoints = getTrajectoryPoints();

  // Calculate power indicator
  const getPower = () => {
    if (!isAiming) return 0;
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragStart.y - dragCurrent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.min((distance / 150) * 100, 100);
  };

  const powerPercent = getPower();

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <div className="text-center mb-2">
        <p className="text-lg font-medium text-foreground/80">
          Score: <span className="text-romantic-pink font-bold text-2xl">{score}</span> / {REQUIRED_SCORE}
        </p>
        <p className="text-sm text-muted-foreground">Swipe UP to shoot! ↑</p>
      </div>

      {message && (
        <div className="text-xl font-bold text-romantic-pink animate-bounce">
          {message}
        </div>
      )}

      <div
        ref={gameRef}
        className="relative bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 rounded-2xl overflow-hidden border-4 border-white/50 shadow-xl touch-none select-none cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Court floor */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500"
          style={{ height: 80 }}
        >
          {/* Floor lines */}
          <div className="absolute top-2 left-0 right-0 h-1 bg-white/30" />
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/20" />
        </div>

        {/* Backboard - Improved graphics */}
        <div 
          className="absolute rounded-sm shadow-2xl"
          style={{ 
            left: HOOP_X + HOOP_WIDTH - 12, 
            top: HOOP_Y - 50,
            width: 18,
            height: 100,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,200,210,0.9) 100%)',
            border: '3px solid #374151',
            boxShadow: '4px 4px 15px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.3)'
          }}
        >
          {/* Backboard target square */}
          <div 
            className="absolute border-[3px] border-red-600 bg-transparent"
            style={{ 
              top: 32,
              left: -28,
              width: 24,
              height: 28,
              boxShadow: '0 0 8px rgba(220,38,38,0.4)'
            }}
          />
        </div>

        {/* Pole - thicker and more realistic */}
        <div 
          className="absolute rounded"
          style={{ 
            left: HOOP_X + HOOP_WIDTH - 3, 
            top: HOOP_Y + 50, 
            width: 12,
            height: 350,
            background: 'linear-gradient(90deg, #4b5563 0%, #6b7280 30%, #9ca3af 50%, #6b7280 70%, #4b5563 100%)',
            boxShadow: '3px 0 10px rgba(0,0,0,0.3)'
          }}
        />

        {/* Hoop connector bracket */}
        <div
          className="absolute"
          style={{
            left: HOOP_X + HOOP_INNER - 5,
            top: HOOP_Y + 5,
            width: 30,
            height: 6,
            background: 'linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)',
            borderRadius: '2px'
          }}
        />

        {/* Hoop rim - Improved 3D effect */}
        <div 
          className="absolute"
          style={{ 
            left: HOOP_X, 
            top: HOOP_Y, 
            width: HOOP_INNER,
            height: 16,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 40%, #9a3412 100%)',
            border: `${RIM_THICKNESS}px solid`,
            borderColor: '#ea580c #c2410c #9a3412 #fb923c',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(251,146,60,0.4)'
          }}
        />

        {/* Net - Improved with more strings and depth */}
        <svg 
          className="absolute pointer-events-none"
          style={{ 
            left: HOOP_X + RIM_THICKNESS - 2, 
            top: HOOP_Y + 14, 
            width: HOOP_INNER - RIM_THICKNESS * 2 + 4, 
            height: 50 
          }}
        >
          <defs>
            <linearGradient id="netGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.95"/>
              <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.7"/>
            </linearGradient>
          </defs>
          {/* Vertical net strings */}
          {Array.from({ length: 9 }).map((_, i) => {
            const startX = i * ((HOOP_INNER - RIM_THICKNESS * 2) / 8);
            const endX = 8 + i * ((HOOP_INNER - RIM_THICKNESS * 2 - 16) / 8);
            return (
              <line 
                key={`v${i}`}
                x1={startX} 
                y1={0} 
                x2={endX} 
                y2={50}
                stroke="url(#netGradient)"
                strokeWidth="2"
              />
            );
          })}
          {/* Horizontal curved net strings */}
          {[0, 1, 2, 3].map((i) => {
            const y = i * 12 + 10;
            const sag = 4 + i * 2;
            const width = HOOP_INNER - RIM_THICKNESS * 2;
            return (
              <path
                key={`h${i}`}
                d={`M 0 ${y - sag} Q ${width / 2} ${y + sag} ${width} ${y - sag}`}
                stroke="url(#netGradient)"
                strokeWidth="1.5"
                fill="none"
              />
            );
          })}
        </svg>

        {/* Trajectory preview - white dots */}
        {isAiming && trajectoryPoints.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none overflow-visible">
            {trajectoryPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={i % 3 === 0 ? 5 : 3}
                fill="white"
                opacity={0.9 - (i / trajectoryPoints.length) * 0.6}
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
              />
            ))}
          </svg>
        )}

        {/* Aiming line */}
        {isAiming && powerPercent > 15 && (
          <svg className="absolute inset-0 pointer-events-none">
            <line
              x1={ballPos.x + BALL_SIZE / 2}
              y1={ballPos.y + BALL_SIZE / 2}
              x2={ballPos.x + BALL_SIZE / 2 + (dragCurrent.x - dragStart.x) * 0.3}
              y2={ballPos.y + BALL_SIZE / 2 - (dragStart.y - dragCurrent.y) * 0.3}
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Basketball */}
        <div
          className="absolute transition-none"
          style={{ 
            left: ballPos.x, 
            top: ballPos.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
            transform: `rotate(${rotation}deg) scale(${isAiming ? 1 + powerPercent / 300 : 1})`,
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg relative overflow-hidden">
            {/* Ball texture */}
            <div className="absolute inset-1 rounded-full border-2 border-orange-700/40" />
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-1 right-1 h-[2px] bg-orange-800/50 -translate-y-1/2" />
            {/* Vertical line */}
            <div className="absolute left-1/2 top-1 bottom-1 w-[2px] bg-orange-800/50 -translate-x-1/2" />
            {/* Curved lines */}
            <div className="absolute top-1 bottom-1 left-1/4 w-[2px] bg-orange-800/30 rounded-full" 
                 style={{ transform: 'rotate(-20deg)' }} />
            <div className="absolute top-1 bottom-1 right-1/4 w-[2px] bg-orange-800/30 rounded-full"
                 style={{ transform: 'rotate(20deg)' }} />
            {/* Highlight */}
            <div className="absolute top-1 left-2 w-3 h-2 bg-white/30 rounded-full blur-sm" />
          </div>
        </div>

        {/* Power indicator */}
        {isAiming && (
          <div className="absolute bottom-28 left-4 w-5 h-28 bg-black/20 rounded-full overflow-hidden border-2 border-white/40">
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-75"
              style={{ 
                height: `${powerPercent}%`,
                background: powerPercent > 70 
                  ? 'linear-gradient(to top, #ef4444, #f97316)' 
                  : powerPercent > 40 
                    ? 'linear-gradient(to top, #f97316, #facc15)'
                    : 'linear-gradient(to top, #22c55e, #84cc16)'
              }}
            />
          </div>
        )}

        {/* Instructions overlay when not flying */}
        {!isFlying && !isAiming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <p className="text-white text-sm font-medium">👆 Swipe up to shoot!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasketballGame;
