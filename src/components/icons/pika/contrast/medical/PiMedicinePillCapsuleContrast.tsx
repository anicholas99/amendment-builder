import React from 'react';

/**
 * PiMedicinePillCapsuleContrast icon from the contrast style in medical category.
 */
interface PiMedicinePillCapsuleContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillCapsuleContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pill-capsule icon',
  ...props
}: PiMedicinePillCapsuleContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4.222 19.778a5.25 5.25 0 0 1 0-7.427l8.129-8.13a5.252 5.252 0 0 1 7.427 7.428l-8.129 8.13a5.25 5.25 0 0 1-7.427 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.286 8.287 4.222 12.35a5.252 5.252 0 0 0 7.427 7.427l4.065-4.064M8.286 8.287l4.065-4.065a5.252 5.252 0 0 1 7.427 7.427l-4.064 4.065M8.286 8.287l7.428 7.427M13.408 8.47l1.768-1.767a1.5 1.5 0 0 1 1.707-.294" fill="none"/>
    </svg>
  );
}
