import React from 'react';

/**
 * PiMagneticCompassDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiMagneticCompassDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMagneticCompassDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'magnetic-compass icon',
  ...props
}: PiMagneticCompassDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.587 15.498a6.33 6.33 0 0 0 5.91-5.91 1.02 1.02 0 0 0-1.084-1.086 6.33 6.33 0 0 0-5.91 5.91c-.04.616.47 1.125 1.084 1.086Z" fill="none"/>
    </svg>
  );
}
