import React from 'react';

/**
 * PiMedicinePillCapsuleDuoStroke icon from the duo-stroke style in medical category.
 */
interface PiMedicinePillCapsuleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillCapsuleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pill-capsule icon',
  ...props
}: PiMedicinePillCapsuleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.222 19.778a5.25 5.25 0 0 1 0-7.427l8.129-8.13a5.252 5.252 0 0 1 7.427 7.428l-8.129 8.13a5.25 5.25 0 0 1-7.427 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.714 15.714 8.287 8.286m5.121.184 1.768-1.767a1.5 1.5 0 0 1 1.708-.294" fill="none"/>
    </svg>
  );
}
