import React from 'react';

/**
 * PiDraggableSixDotsDuoStroke icon from the duo-stroke style in general category.
 */
interface PiDraggableSixDotsDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDraggableSixDotsDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'draggable-six-dots icon',
  ...props
}: PiDraggableSixDotsDuoStrokeProps): JSX.Element {
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
      <g opacity=".28"><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/>
    </svg>
  );
}
