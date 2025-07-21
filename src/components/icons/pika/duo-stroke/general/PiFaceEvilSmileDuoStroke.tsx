import React from 'react';

/**
 * PiFaceEvilSmileDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFaceEvilSmileDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceEvilSmileDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'face-evil-smile icon',
  ...props
}: PiFaceEvilSmileDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.386 9.145 1.228.86m4.771 0 1.229-.86M15.57 14.5A5 5 0 0 1 12 16a5 5 0 0 1-3.57-1.5" fill="none"/>
    </svg>
  );
}
