// UTAX "U" monogram — extracted as a standalone vector mark per the UI
// redesign brief (§3.3): used for the sidebar/login/empty-state badge only.
// The full robot mascot is a separate illustration and is never used here
// or as an org-chart employee avatar.
export function UMark({ size = 32, className }: { size?: number; className?: string }) {
  const gradientId = "u-mark-gradient";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="UTAX"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#351078" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <path
        d="M11 8 V22 A9 9 0 0 0 29 22 V8"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 1.5 L21.6 6.2 L26.5 6.5 L22.9 9.4 L24.1 14 L20 11.4 L15.9 14 L17.1 9.4 L13.5 6.5 L18.4 6.2 Z"
        fill="#168EF0"
      />
    </svg>
  );
}
