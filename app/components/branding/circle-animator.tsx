"use client";

type Circle = {
  color: string;
  delay: string;
  duration: string;
  size: string;
  x: string;
  y: string;
};

const circles: Circle[] = [
  { color: "bg-[#e3a641]/8", delay: "0s", duration: "18s", size: "size-[320px]", x: "10%", y: "15%" },
  { color: "bg-[#426b95]/6", delay: "3s", duration: "22s", size: "size-[260px]", x: "75%", y: "10%" },
  { color: "bg-[#e3a641]/5", delay: "6s", duration: "25s", size: "size-[400px]", x: "55%", y: "60%" },
  { color: "bg-[#7ba3cc]/6", delay: "2s", duration: "20s", size: "size-[200px]", x: "20%", y: "70%" },
  { color: "bg-[#e3a641]/7", delay: "8s", duration: "16s", size: "size-[180px]", x: "85%", y: "45%" },
];

export function CircleAnimator() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {circles.map((circle, i) => (
        <div
          className={`circle-animator absolute rounded-full ${circle.color} ${circle.size} blur-3xl`}
          key={i}
          style={{
            animationDelay: circle.delay,
            animationDuration: circle.duration,
            left: circle.x,
            top: circle.y,
          }}
        />
      ))}
    </div>
  );
}

export function CircleAnimatorDark() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="circle-animator absolute left-[15%] top-[20%] size-[350px] rounded-full bg-white/[0.03] blur-3xl" style={{ animationDuration: "20s" }} />
      <div className="circle-animator absolute right-[10%] top-[50%] size-[250px] rounded-full bg-[#e3a641]/[0.06] blur-3xl" style={{ animationDelay: "4s", animationDuration: "18s" }} />
      <div className="circle-animator absolute left-[60%] top-[10%] size-[200px] rounded-full bg-white/[0.04] blur-2xl" style={{ animationDelay: "7s", animationDuration: "24s" }} />
    </div>
  );
}
