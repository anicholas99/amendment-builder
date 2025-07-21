import React from 'react';

/**
 * PiNavigationHorizontalDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiNavigationHorizontalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNavigationHorizontalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'navigation-horizontal icon',
  ...props
}: PiNavigationHorizontalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.44 17.732-5.083 3.176a.592.592 0 0 1-.89-.632l.127-.559a51.2 51.2 0 0 1 6.939-16.463.556.556 0 0 1 .934 0 51.2 51.2 0 0 1 6.939 16.463l.127.559a.591.591 0 0 1-.89.632l-5.084-3.177a2.94 2.94 0 0 0-3.12 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.533 20.276a.591.591 0 0 1-.89.632l-5.084-3.177a2.94 2.94 0 0 0-3.12 0l-5.082 3.177a.591.591 0 0 1-.89-.632" fill="none"/>
    </svg>
  );
}
