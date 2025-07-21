import React from 'react';

/**
 * PiUserAIDuoStroke icon from the duo-stroke style in ai category.
 */
interface PiUserAIDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserAIDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-ai icon',
  ...props
}: PiUserAIDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h3.533" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 21zm2-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm2 7c-.637 1.617-1.34 2.345-3 3 1.66.655 2.363 1.384 3 3 .637-1.616 1.34-2.345 3-3-1.66-.655-2.363-1.383-3-3Z" fill="none"/>
    </svg>
  );
}
