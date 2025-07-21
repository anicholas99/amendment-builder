import React from 'react';

/**
 * PiControlTowerDuoStroke icon from the duo-stroke style in building category.
 */
interface PiControlTowerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiControlTowerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'control-tower icon',
  ...props
}: PiControlTowerDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.005 13h9.99a2.5 2.5 0 0 0 2.44-1.958L20.111 8H3.89l.676 3.042A2.5 2.5 0 0 0 7.005 13Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.13 4H4.87a1.5 1.5 0 0 0-1.464 1.825L3.889 8H20.11l.483-2.175A1.5 1.5 0 0 0 19.13 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 8 1 5" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 8-1 5" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3V2" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 13-.5 9M17 13l.5 9" fill="none"/>
    </svg>
  );
}
