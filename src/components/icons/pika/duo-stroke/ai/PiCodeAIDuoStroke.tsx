import React from 'react';

/**
 * PiCodeAIDuoStroke icon from the duo-stroke style in ai category.
 */
interface PiCodeAIDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCodeAIDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'code-ai icon',
  ...props
}: PiCodeAIDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.466 4.188c-1.657 0-3 1.194-3 2.667V9.52c0 1.473-1.343 2.667-3 2.667 1.657 0 3 1.194 3 2.667v2.666c0 1.473 1.343 2.667 3 2.667m8-16c1.657 0 3 1.194 3 2.667V9.52c0 1.473 1.343 2.667 3 2.667-1.657 0-3 1.194-3 2.667v2.666c0 1.473-1.343 2.667-3 2.667" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.966 16zm4-7c-.638 1.617-1.34 2.345-3 3 1.66.655 2.362 1.383 3 3 .637-1.617 1.338-2.345 3-3-1.662-.655-2.363-1.383-3-3Z" fill="none"/>
    </svg>
  );
}
