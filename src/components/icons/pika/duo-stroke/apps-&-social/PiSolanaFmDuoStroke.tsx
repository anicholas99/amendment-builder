import React from 'react';

/**
 * PiSolanaFmDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiSolanaFmDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSolanaFmDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'solana-fm icon',
  ...props
}: PiSolanaFmDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.515 12.5A7 7 0 0 1 9 18.58m-.515-7.08a7 7 0 0 1 6.942-6.094" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.988 12.5C18.728 17.79 14.355 22 9 22M5.012 11.5C5.272 6.21 9.645 2 15 2M9 15a3 3 0 0 0 3-3 3 3 0 0 1 3-3" fill="none"/>
    </svg>
  );
}
