"use client";

export function GradientMesh({ className = "" }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden="true">
      <div className="absolute -left-[20%] -top-[10%] h-[600px] w-[600px] rounded-full bg-[#e3a641]/[0.07] blur-[120px] animate-[mesh_20s_ease-in-out_infinite]" />
      <div className="absolute -right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#426b95]/[0.06] blur-[100px] animate-[mesh_25s_ease-in-out_infinite_3s]" />
      <div className="absolute bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full bg-[#e3a641]/[0.05] blur-[80px] animate-[mesh_22s_ease-in-out_infinite_7s]" />
      <style>{`
        @keyframes mesh {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
