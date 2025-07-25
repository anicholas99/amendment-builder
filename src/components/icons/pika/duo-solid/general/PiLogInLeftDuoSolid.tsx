import React from 'react';

/**
 * PiLogInLeftDuoSolid icon from the duo-solid style in general category.
 */
interface PiLogInLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLogInLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'log-in-left icon',
  ...props
}: PiLogInLeftDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4.528A6 6 0 0 1 21 9v6a6 6 0 0 1-10 4.472" opacity=".28"/><path fill={color || "currentColor"} d="M13.789 8.2a1 1 0 0 0-1.595.9q.047.46.098.884c.04.35.08.686.11 1.016H3a1 1 0 1 0 0 2h9.401q-.045.493-.11 1.015-.05.424-.098.885a1 1 0 0 0 1.596.9 16 16 0 0 0 2.83-2.727 1.7 1.7 0 0 0 0-2.146A16 16 0 0 0 13.79 8.2Z"/>
    </svg>
  );
}
