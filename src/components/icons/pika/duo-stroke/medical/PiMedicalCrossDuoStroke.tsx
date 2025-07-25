import React from 'react';

/**
 * PiMedicalCrossDuoStroke icon from the duo-stroke style in medical category.
 */
interface PiMedicalCrossDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicalCrossDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'medical-cross icon',
  ...props
}: PiMedicalCrossDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.152 4.235C9 4.602 9 5.068 9 6v3H6c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 10.602 3 11.068 3 12s0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C4.602 15 5.068 15 6 15h3v3c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C10.602 21 11.068 21 12 21s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C15 19.398 15 18.932 15 18v-3h3c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C21 13.398 21 12.932 21 12s0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C19.398 9 18.932 9 18 9h-3V6c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C13.398 3 12.932 3 12 3s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.235 9.152a2 2 0 0 0-1.083 1.083C3 10.602 3 11.068 3 12s0 1.398.152 1.765a2 2 0 0 0 1.083 1.083m4.917 4.917a2 2 0 0 0 1.083 1.083C10.602 21 11.068 21 12 21s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083m4.917-4.917a2 2 0 0 0 1.083-1.083C21 13.398 21 12.932 21 12s0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083m-4.917-4.917a2 2 0 0 0-1.083-1.083C13.398 3 12.932 3 12 3s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083" fill="none"/>
    </svg>
  );
}
