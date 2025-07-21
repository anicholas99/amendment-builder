import React from 'react';

/**
 * PiKeyRight02DuoStroke icon from the duo-stroke style in security category.
 */
interface PiKeyRight02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyRight02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'key-right-02 icon',
  ...props
}: PiKeyRight02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 10h9l2 2-2 2h-3l-1.146-1.146a.5.5 0 0 0-.708 0L14 14h-3" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 10h-.468a4.5 4.5 0 1 0 0 4H11" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 13v-2a1.25 1.25 0 0 0 0 2Z" fill="none"/>
    </svg>
  );
}
