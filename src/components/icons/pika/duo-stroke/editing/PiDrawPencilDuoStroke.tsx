import React from 'react';

/**
 * PiDrawPencilDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiDrawPencilDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDrawPencilDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'draw-pencil icon',
  ...props
}: PiDrawPencilDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.012 13 8 14.692v3.231M9.012 13 12 8l2.988 5m-5.976 0h5.976m0 0L16 14.692v3.231" fill="none"/>
    </svg>
  );
}
