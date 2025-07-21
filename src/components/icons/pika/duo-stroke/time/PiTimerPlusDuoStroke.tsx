import React from 'react';

/**
 * PiTimerPlusDuoStroke icon from the duo-stroke style in time category.
 */
interface PiTimerPlusDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTimerPlusDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'timer-plus icon',
  ...props
}: PiTimerPlusDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4m0 0a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-2-4h4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17v-3m0 0v-3m0 3H9m3 0h3m4.366-8.678 1.06 1.06" fill="none"/>
    </svg>
  );
}
