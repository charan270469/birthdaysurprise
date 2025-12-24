import { useEffect, useState, useRef } from "react";
import Confetti from "./Confetti";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Camera, RotateCcw } from "lucide-react";

interface BirthdayRevealProps {
  imageSrc?: string;
}

type PhotoPrompt = {
  id: number;
  text: string;
  image: string | null;
};

const BirthdayReveal = ({ imageSrc }: BirthdayRevealProps) => {
  const [showContent, setShowContent] = useState(false);
  const [photos, setPhotos] = useState<PhotoPrompt[]>([
    { id: 1, text: "make this '😋'", image: null },
    { id: 2, text: "make a pout '😙'", image: null },
    { id: 3, text: "wink at me '😉'", image: null },
    { id: 4, text: "your fav pose?? 📸", image: null },
  ]);
  const [showScreenshotDialog, setShowScreenshotDialog] = useState(false);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    
    // Cleanup camera stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle video element when camera is active
  useEffect(() => {
    if (activeCameraIndex !== null && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      
      const handleCanPlay = () => {
        video.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      };
      
      video.addEventListener('canplay', handleCanPlay);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [activeCameraIndex]);

  const startCamera = async (index: number) => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      setActiveCameraIndex(index);
      
      // Wait a bit for the video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((error) => {
            console.error("Error playing video:", error);
          });
          
          // Ensure video is playing
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch((error) => {
                console.error("Error playing video after metadata:", error);
              });
            }
          };
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please allow camera permissions.");
      setActiveCameraIndex(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActiveCameraIndex(null);
  };

  const capturePhoto = (index: number) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Wait for video to be ready
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw the video normally (not mirrored) - the video display is mirrored but the saved image should be normal
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/png');
          
          setPhotos(prev => {
            const updated = prev.map(photo => 
              photo.id === index ? { ...photo, image: imageData } : photo
            );
            
            // Check if all 4 photos are taken
            const allPhotosTaken = updated.every(photo => photo.image !== null);
            if (allPhotosTaken && !showScreenshotDialog) {
              setTimeout(() => {
                setShowScreenshotDialog(true);
              }, 500);
            }
            
            return updated;
          });
          
          stopCamera();
        }
      } else {
        // Wait a bit and try again if video isn't ready
        setTimeout(() => {
          if (video.readyState >= 2 && video.videoWidth > 0) {
            capturePhoto(index);
          } else {
            alert("Camera not ready. Please wait a moment and try again.");
          }
        }, 200);
      }
    }
  };

  const handleCardClick = (index: number) => {
    const photo = photos.find(p => p.id === index);
    if (photo && !photo.image) {
      startCamera(index);
    }
  };

  const handleRetake = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setPhotos(prev => prev.map(photo => 
      photo.id === index ? { ...photo, image: null } : photo
    ));
    // Open camera immediately after clearing the photo
    setTimeout(() => {
      startCamera(index);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden p-4 md:p-6 relative" style={{ background: 'var(--gradient-romantic)' }}>
      <Confetti active={true} />
      
      <div 
        className={`flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-6xl transition-all duration-1000 bg-transparent overflow-hidden ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* center Section - Birthday Message */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          {/* Birthday Title */}
          <div className="mb-3 md:mb-6 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black uppercase mb-1 md:mb-2">
              HAPPY BIRTHDAY
            </h1>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black uppercase inline-flex items-center gap-2">
              MEDHA <span className="text-4xl md:text-6xl">🎂</span>
            </h2>
          </div>

          {/* Message Box - Floating Rounded Rectangle */}
          <div className="rounded-2xl p-4 md:p-6 shadow-2xl w-full max-w-md text-center overflow-hidden">
            <p className="text-sm md:text-base lg:text-lg text-gray-800 leading-relaxed text-center font-medium">
              🌸 To the most dumbest person ever hehehe 🌸
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-800 leading-relaxed text-center mt-2 md:mt-3">
              May your day be filled with endless joy, laughter, and all the love you deserve (and drama so that I get time to time updates ofc naaku kuda tea with tea kavali ga madam 🫠)
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-800 leading-relaxed text-center mt-2 md:mt-3">
              You make the world a brighter place just by being you!(cringee kadaa 😭 hehe ik thats just me 🥰)
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-800 leading-relaxed text-center mt-2 md:mt-3 font-semibold">
              Wishing you the happiest birthday!💗✨
            </p>
          </div>
        </div>

        {/* Right Section - Photo Prompt Cards */}
        <div className="flex-1 grid grid-cols-2 gap-2 md:gap-4 overflow-hidden">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-lg p-2 md:p-4 flex flex-col gap-2 md:gap-3 shadow-md bg-transparent overflow-hidden"
            >
              <p className="text-base font-semibold text-gray-900 text-center">
                {photo.text}
              </p>
              
              {/* Image Display - Clickable when no image */}
              <div 
                className={`w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-pink-200/20 to-purple-200/20 border-4 border-white/50 shadow-lg flex items-center justify-center relative ${
                  !photo.image ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                }`}
                onClick={() => !photo.image && handleCardClick(photo.id)}
              >
                {photo.image ? (
                  <>
                    <img 
                      src={photo.image} 
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Retake Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => handleRetake(photo.id, e)}
                        className="bg-[#ff69b4] hover:bg-[#ff1493] text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-lg transition-all hover:scale-110"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retake
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mt-2 font-medium">Tap Here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Modal */}
      {activeCameraIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
              {photos.find(p => p.id === activeCameraIndex)?.text}
            </h3>
            
            <div className="relative mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              {videoRef.current && videoRef.current.readyState < 2 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <p>Loading camera...</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={stopCamera}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => capturePhoto(activeCameraIndex)}
                className="flex-1 bg-[#ff69b4] hover:bg-[#ff1493] text-white"
              >
                Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Dialog */}
      <Dialog open={showScreenshotDialog} onOpenChange={setShowScreenshotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">📸</DialogTitle>
            <DialogDescription className="text-center text-base pt-4">
              Now take a screen if you would like to save this memory to your mobile since you are dumbass to remember it...anthe iga bieee😋✨
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowScreenshotDialog(false)}
              className="bg-[#ff69b4] hover:bg-[#ff1493] text-white"
            >
              Got it! 💖
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🎈', '🎁', '🎊', '⭐', '🎀', '🌟'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-3xl animate-float-heart"
              style={{
                left: `${10 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BirthdayReveal;
