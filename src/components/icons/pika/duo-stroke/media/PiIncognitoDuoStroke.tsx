import React from 'react';

/**
 * PiIncognitoDuoStroke icon from the duo-stroke style in media category.
 */
interface PiIncognitoDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiIncognitoDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'incognito icon',
  ...props
}: PiIncognitoDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.583 9.718-2.611-4.897a3 3 0 0 0-3.02-1.565 14.6 14.6 0 0 1-3.904 0A3 3 0 0 0 7.03 4.821L4.417 9.718M10 17h4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 10.26a40 40 0 0 1 2.417-.542 40.4 40.4 0 0 1 15.166 0q1.222.234 2.417.542M10 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" fill="none"/>
    </svg>
  );
}
