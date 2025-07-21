import React from 'react';

/**
 * PiMouseScrollDownDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiMouseScrollDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMouseScrollDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'mouse-scroll-down icon',
  ...props
}: PiMouseScrollDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14v-4a7 7 0 1 0-14 0v4a7 7 0 1 0 14 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9.5a10 10 0 0 1-1.704 1.77.47.47 0 0 1-.592 0A10 10 0 0 1 10 9.5" fill="none"/>
    </svg>
  );
}
