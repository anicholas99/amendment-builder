import React from 'react';

/**
 * PiToggleOnDuoStroke icon from the duo-stroke style in general category.
 */
interface PiToggleOnDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiToggleOnDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'toggle-on icon',
  ...props
}: PiToggleOnDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5H9a7 7 0 0 0 0 14h6a7 7 0 1 0 0-14Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" fill="none"/>
    </svg>
  );
}
