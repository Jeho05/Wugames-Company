"use client";

export function ShimmerText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      className={
        "inline-block bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_4s_ease-in-out_infinite] " +
        className
      }
      style={{
        backgroundImage: "linear-gradient(120deg, #17294b 0%, #17294b 40%, #e3a641 50%, #17294b 60%, #17294b 100%)",
      }}
    >
      {text}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% center; }
          50% { background-position: 0% center; }
        }
      `}</style>
    </span>
  );
}
