import { Heart } from "lucide-react";

const hearts = [
  { left: "8%", top: "15%", size: 14, delay: "0s", duration: "7s" },
  { left: "18%", top: "55%", size: 10, delay: "1.2s", duration: "8s" },
  { left: "85%", top: "20%", size: 16, delay: "0.6s", duration: "6.5s" },
  { left: "92%", top: "60%", size: 12, delay: "2s", duration: "9s" },
  { left: "45%", top: "8%", size: 9, delay: "1.5s", duration: "7.5s" },
  { left: "70%", top: "78%", size: 13, delay: "0.3s", duration: "8.5s" },
];

export function FloatingHearts() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {hearts.map((h, i) => (
        <Heart
          key={i}
          className="absolute fill-primary/30 text-primary/40 animate-float"
          style={{
            left: h.left,
            top: h.top,
            width: h.size * 2,
            height: h.size * 2,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        />
      ))}
    </div>
  );
}