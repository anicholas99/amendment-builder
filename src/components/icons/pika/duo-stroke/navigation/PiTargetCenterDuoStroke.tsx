import React from 'react';

/**
 * PiTargetCenterDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiTargetCenterDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTargetCenterDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'target-center icon',
  ...props
}: PiTargetCenterDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 12a5 5 0 0 0-10 0c0 2.724 2.29 5 5 5a5 5 0 0 0 5-5Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12A9.15 9.15 0 1 1 12 21.15c-4.958 0-9.15-4.166-9.15-9.15Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15V2.85M2.85 12h18.3" fill="none"/>
    </svg>
  );
}
