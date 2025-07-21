import React from 'react';

/**
 * PiAwardMedalDuoStroke icon from the duo-stroke style in general category.
 */
interface PiAwardMedalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAwardMedalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'award-medal icon',
  ...props
}: PiAwardMedalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.365 14.473 18 22c-4.286-2.664-7.714-2.664-12 0l1.635-7.527" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9A7 7 0 1 1 5 9a7 7 0 0 1 14 0Z" fill="none"/>
    </svg>
  );
}
