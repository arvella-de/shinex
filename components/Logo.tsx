type LogoProps = {
  dark?: boolean;
  className?: string;
};

export default function Logo({ dark = false, className = "" }: LogoProps) {
  const textColor = dark ? "#F7F4EC" : "#0E1721";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path
          d="M15 2C15 2 6 13.2 6 19.2C6 24.3 10.03 28 15 28C19.97 28 24 24.3 24 19.2C24 13.2 15 2 15 2Z"
          fill="#F2A63B"
        />
        <path
          d="M15 8.5C15 8.5 10.5 15 10.5 18.6C10.5 21.4 12.5 23.4 15 23.4"
          stroke="#146B5C"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span
        className="font-display text-xl font-semibold tracking-tight"
        style={{ color: textColor }}
      >
        Shinex
      </span>
    </span>
  );
}
