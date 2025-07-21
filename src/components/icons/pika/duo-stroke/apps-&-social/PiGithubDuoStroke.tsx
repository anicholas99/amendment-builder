import React from 'react';

/**
 * PiGithubDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiGithubDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGithubDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'github icon',
  ...props
}: PiGithubDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15a3.72 3.72 0 0 0-1 2.58v1.47m0 0V21m0-1.95a5.7 5.7 0 0 1-2.82.36c-1.52-.52-1.12-1.9-1.9-2.47A2.37 2.37 0 0 0 3 16.5M14 15a3.72 3.72 0 0 1 1 2.58V21" opacity=".28" fill="none"/><path fillRule="evenodd" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9.75c0 3-1.95 5.25-7 5.25s-7-2.25-7-5.25a6.3 6.3 0 0 1 .68-3c-.34-1.47-.21-3.28.52-3.64s2.27.3 3.54 1.15a13 13 0 0 1 2.26-.2c.757-.007 1.513.053 2.26.18 1.27-.85 2.88-1.48 3.54-1.15s.86 2.17.52 3.64A6.3 6.3 0 0 1 19 9.75Z" clipRule="evenodd" fill="none"/>
    </svg>
  );
}
