import React from 'react';

/**
 * PiListDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-default icon',
  ...props
}: PiListDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 6H9m12 6H9m12 6H9" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 18a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/>
    </svg>
  );
}
