import React from 'react';

/**
 * PiScissorsDefaultDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScissorsDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScissorsDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scissors-default icon',
  ...props
}: PiScissorsDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.4 3 12 11.4m0 0L3.6 3m8.4 8.4 3.454 3.454M12 11.4l-3.455 3.454" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.4 17.4a3.6 3.6 0 1 1 7.2 0 3.6 3.6 0 0 1-7.2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 13.8A3.6 3.6 0 1 1 6 21a3.6 3.6 0 0 1 0-7.2Z" fill="none"/>
    </svg>
  );
}
