import React from 'react';

/**
 * PiIdCardVerticalDuoStroke icon from the duo-stroke style in users category.
 */
interface PiIdCardVerticalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiIdCardVerticalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'id-card-vertical icon',
  ...props
}: PiIdCardVerticalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 3H7a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6h6m-6 4h3m5.667 6h-3.334c-.736 0-1.333.597-1.333 1.333 0 .369.299.667.667.667h4.666a.667.667 0 0 0 .667-.667c0-.736-.597-1.333-1.333-1.333ZM15 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/>
    </svg>
  );
}
