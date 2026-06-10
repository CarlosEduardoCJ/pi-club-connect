import { GraduationCap } from "lucide-react";

interface Props {
  size?: "sm" | "md";
  className?: string;
}

export default function TeacherBadge({ size = "sm", className = "" }: Props) {
  const s = size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground font-bold ${s} ${className}`}
      title="Professor"
    >
      <GraduationCap className="w-3 h-3" />
      Professor
    </span>
  );
}
