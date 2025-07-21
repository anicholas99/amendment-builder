import React from 'react';

/**
 * PiFireplaceDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFireplaceDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFireplaceDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'fireplace icon',
  ...props
}: PiFireplaceDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h2m0 0V7m0 14h14m2 0h-2m0 0V7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.616 11c-.276 1.294-.795 2.808-1.616 2.808a12 12 0 0 1-1.145-1.353C9.37 13.13 9 13.955 9 14.84c0 1.483 1 2.967 3 2.967s3-1.483 3-2.967c0-1.75-1.443-3.27-2.384-3.84Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 7h-15A1.5 1.5 0 0 1 3 5.5v-1A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v1A1.5 1.5 0 0 1 19.5 7Z" fill="none"/>
    </svg>
  );
}
