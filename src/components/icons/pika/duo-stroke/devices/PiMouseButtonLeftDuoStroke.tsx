import React from 'react';

/**
 * PiMouseButtonLeftDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiMouseButtonLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMouseButtonLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'mouse-button-left icon',
  ...props
}: PiMouseButtonLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14v-4a7 7 0 0 0-7-7v4.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C10.48 11 9.92 11 8.8 11H5v3a7 7 0 1 0 14 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10a7 7 0 0 1 7-7v4.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C10.48 11 9.92 11 8.8 11H5z" fill="none"/>
    </svg>
  );
}
