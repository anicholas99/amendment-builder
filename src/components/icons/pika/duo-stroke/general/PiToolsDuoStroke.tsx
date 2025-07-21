import React from 'react';

/**
 * PiToolsDuoStroke icon from the duo-stroke style in general category.
 */
interface PiToolsDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiToolsDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'tools icon',
  ...props
}: PiToolsDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21.156 21.392-5.157-5.157M5.449 9.91 3.476 7.938c-.328-.329-.492-.493-.608-.652a2.5 2.5 0 0 1 0-2.939 6 6 0 0 1 1.26-1.26 2.5 2.5 0 0 1 2.94 0c.158.115.323.28.651.608l2.279 2.28" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.668 7.84c.143.582.442 1.134.9 1.592.459.458 1.01.757 1.592.9m-2.492-2.491a3.42 3.42 0 0 1 1.224-3.526L17.235 2.5l-.32.616a2.944 2.944 0 0 0 3.97 3.969l.615-.32-1.814 2.343a3.42 3.42 0 0 1-3.526 1.225M13.668 7.84l-10.1 8.768a6 6 0 0 0-.403.364c-1.053 1.111-.72 2.616.263 3.6.984.983 2.488 1.316 3.6.262.084-.08.177-.188.362-.4l8.77-10.102" fill="none"/>
    </svg>
  );
}
