// DropOS Logo Component — matches the generated brand assets
// Dark variant: white text (for dark navbar/dashboard)
// Light variant: purple text (for light backgrounds/storefront)

interface LogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

export function Logo({ variant = "dark", size = "md", iconOnly = false }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 18, gap: 8 },
    md: { icon: 36, text: 24, gap: 10 },
    lg: { icon: 48, text: 32, gap: 14 },
  };
  const s = sizes[size];
  const textColor = variant === "dark" ? "#ffffff" : "#7C3AED";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: s.gap, userSelect: "none" }}>
      {/* Icon: rounded square + drop + bolt */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="dropGrad" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="100" height="100" rx="22" fill="url(#bgGrad)" />
        {/* Drop shape */}
        <path
          d="M50 18 C50 18 28 42 28 58 C28 70 38 80 50 80 C62 80 72 70 72 58 C72 42 50 18 50 18Z"
          fill="url(#dropGrad)"
        />
        {/* Lightning bolt */}
        <path
          d="M57 26 L40 54 L50 54 L43 76 L62 46 L52 46 Z"
          fill="white"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <svg
          height={s.text}
          viewBox="0 0 180 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <text
            x="0"
            y="32"
            fontFamily="'Inter', 'SF Pro Display', system-ui, sans-serif"
            fontWeight="700"
            fontSize="36"
            fill={textColor}
            letterSpacing="-1"
          >
            DropOS
          </text>
        </svg>
      )}
    </div>
  );
}
