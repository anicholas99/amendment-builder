import React from 'react';

/**
 * PiScissorsRightDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScissorsRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScissorsRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scissors-right icon',
  ...props
}: PiScissorsRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 20.4 12.6 12m0 0L21 3.6M12.6 12l-3.454 3.454M12.601 12 9.146 8.545" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.6 14.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.2 6A3.6 3.6 0 1 1 3 6a3.6 3.6 0 0 1 7.2 0Z" fill="none"/>
    </svg>
  );
}
