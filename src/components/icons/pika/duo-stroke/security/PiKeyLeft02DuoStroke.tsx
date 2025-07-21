import React from 'react';

/**
 * PiKeyLeft02DuoStroke icon from the duo-stroke style in security category.
 */
interface PiKeyLeft02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyLeft02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'key-left-02 icon',
  ...props
}: PiKeyLeft02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.001 10h-9l-2 2 2 2h3l1.146-1.146a.5.5 0 0 1 .708 0L10.001 14h3" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10h.469a4.5 4.5 0 1 1 0 4H13" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.501 13v-2a1.25 1.25 0 0 1 0 2Z" fill="none"/>
    </svg>
  );
}
