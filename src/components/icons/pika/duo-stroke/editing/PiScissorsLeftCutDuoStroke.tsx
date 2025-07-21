import React from 'react';

/**
 * PiScissorsLeftCutDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScissorsLeftCutDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScissorsLeftCutDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scissors-left-cut icon',
  ...props
}: PiScissorsLeftCutDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.68 11.875 5.292 4.487m7.388 7.388 3.039 3.039m-3.039-3.039 3.039-3.039m-3.039 3.04-7.388 7.388" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.875 11.875h1m-5 0h1" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.719 14.914a3.167 3.167 0 1 1 4.478 4.478 3.167 3.167 0 0 1-4.478-4.478Zm0-6.078a3.167 3.167 0 1 1 4.478-4.478 3.167 3.167 0 0 1-4.478 4.478Z" fill="none"/>
    </svg>
  );
}
