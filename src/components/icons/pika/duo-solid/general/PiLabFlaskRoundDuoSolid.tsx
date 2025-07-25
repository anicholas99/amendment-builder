import React from 'react';

/**
 * PiLabFlaskRoundDuoSolid icon from the duo-solid style in general category.
 */
interface PiLabFlaskRoundDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLabFlaskRoundDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'lab-flask-round icon',
  ...props
}: PiLabFlaskRoundDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3h4m-4 0H9m1 0v3.128c0 .674-.458 1.252-1.073 1.529a7.51 7.51 0 0 0-4.354 5.796C12 10 14 17.5 19.486 14.966a7.5 7.5 0 0 0-4.412-7.31C14.457 7.38 14 6.803 14 6.129V3m0 0h1" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M16.149 14.349c.86.235 1.771.24 2.917-.29a1 1 0 0 1 1.418.97 8.5 8.5 0 1 1-16.902-1.714 1 1 0 0 1 .569-.768c2.01-.934 3.72-1.155 5.248-.948 1.504.203 2.754.812 3.829 1.384l.508.274c.885.479 1.623.877 2.413 1.092ZM9 15a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2z" clipRule="evenodd"/>
    </svg>
  );
}
