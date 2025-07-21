import React from 'react';

/**
 * PiFaceAnnoyedBoredDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFaceAnnoyedBoredDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceAnnoyedBoredDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'face-annoyed-bored icon',
  ...props
}: PiFaceAnnoyedBoredDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15H8m2-5H8m8 0h-2" fill="none"/>
    </svg>
  );
}
