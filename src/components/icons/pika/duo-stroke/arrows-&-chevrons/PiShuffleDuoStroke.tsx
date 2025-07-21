import React from 'react';

/**
 * PiShuffleDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiShuffleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShuffleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'shuffle icon',
  ...props
}: PiShuffleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 7h-3.876a6 6 0 0 0-4.915 2.56L8.79 14.44A6 6 0 0 1 3.876 17H2m19 0h-3.876a6 6 0 0 1-3.808-1.363M2 7h1.876a6 6 0 0 1 3.969 1.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.189 4c.986.74 1.878 1.599 2.654 2.556a.7.7 0 0 1 0 .888A15 15 0 0 1 18.189 10m0 10a15 15 0 0 0 2.654-2.556.704.704 0 0 0 0-.888A15 15 0 0 0 18.189 14" fill="none"/>
    </svg>
  );
}
