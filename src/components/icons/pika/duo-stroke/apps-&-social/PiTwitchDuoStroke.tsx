import React from 'react';

/**
 * PiTwitchDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiTwitchDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTwitchDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'twitch icon',
  ...props
}: PiTwitchDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.8 3h8.4c1.68 0 2.52 0 3.162.31a2.93 2.93 0 0 1 1.311 1.246C21 5.166 21 5.964 21 7.56v4.322c0 .929 0 1.394-.11 1.831a3.7 3.7 0 0 1-.48 1.099c-.247.383-.593.712-1.285 1.369l-.25.238c-.692.657-1.038.986-1.442 1.221a4.1 4.1 0 0 1-1.156.455c-.46.105-.95.105-1.928.105H12L8 22v-3.8h-.2c-1.68 0-2.52 0-3.162-.31a2.93 2.93 0 0 1-1.311-1.246C3 16.034 3 15.236 3 13.64V7.56c0-1.596 0-2.394.327-3.004a2.93 2.93 0 0 1 1.311-1.245C5.28 3 6.12 3 7.8 3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V7.75M16 11V7.75" fill="none"/>
    </svg>
  );
}
