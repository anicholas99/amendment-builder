import React from 'react';

/**
 * PiMartiniGlassDuoStroke icon from the duo-stroke style in food category.
 */
interface PiMartiniGlassDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMartiniGlassDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'martini-glass icon',
  ...props
}: PiMartiniGlassDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13v8m0 0h5.5M12 21H7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 7 6 6 6-6M6 7 3 4h18l-3 3M6 7c3.993.333 8.007.333 12 0" fill="none"/>
    </svg>
  );
}
