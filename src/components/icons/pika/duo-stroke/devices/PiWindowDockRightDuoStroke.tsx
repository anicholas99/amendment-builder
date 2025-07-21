import React from 'react';

/**
 * PiWindowDockRightDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiWindowDockRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWindowDockRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'window-dock-right icon',
  ...props
}: PiWindowDockRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 17V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3Z" opacity=".28" fill="none"/><path fill="none" d="M13 8h4v8h-4z"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 8h4v8h-4z" fill="none"/>
    </svg>
  );
}
