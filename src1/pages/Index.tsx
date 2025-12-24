import FloatingHearts from "@/components/FloatingHearts";
import RomanticCard from "@/components/RomanticCard";

const Index = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <title>Made Just For You 💖</title>
      <meta name="description" content="A special romantic surprise made just for you with love 💕" />
      
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
        {/* Floating hearts background */}
        <FloatingHearts />
        
        {/* Main content */}
        <main className="relative z-10">
          <RomanticCard />
        </main>
        
        {/* Decorative sparkles */}
        <div className="fixed top-10 left-10 text-2xl animate-sparkle" style={{ animationDelay: "0s" }}>✨</div>
        <div className="fixed top-20 right-20 text-xl animate-sparkle" style={{ animationDelay: "0.5s" }}>✨</div>
        <div className="fixed bottom-20 left-20 text-3xl animate-sparkle" style={{ animationDelay: "1s" }}>✨</div>
        <div className="fixed bottom-10 right-10 text-2xl animate-sparkle" style={{ animationDelay: "1.5s" }}>✨</div>
        <div className="fixed top-1/3 left-5 text-lg animate-sparkle" style={{ animationDelay: "0.7s" }}>💫</div>
        <div className="fixed top-1/4 right-10 text-xl animate-sparkle" style={{ animationDelay: "1.2s" }}>💫</div>
      </div>
    </>
  );
};

export default Index;
