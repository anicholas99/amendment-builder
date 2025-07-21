import React from 'react';

/**
 * PiVscodeDuoStroke icon from the duo-stroke style in development category.
 */
interface PiVscodeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVscodeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'vscode icon',
  ...props
}: PiVscodeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.799 12 17 16v5l-7.789-7.01M11.8 12l-2.587-1.99M11.799 12 17 7.996V3l-7.788 7.01m0 0L4 6 2 7.5 7 12m0 0-5 4.5L4 18l5.211-4.01M7 12l2.211 1.99" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.231 19.385 17 21V3l3.231 1.616c.642.32.963.481 1.198.72a2 2 0 0 1 .462.748C22 6.4 22 6.76 22 7.478v9.044c0 .718 0 1.077-.11 1.394a2 2 0 0 1-.461.747c-.235.24-.556.4-1.198.721Z" fill="none"/>
    </svg>
  );
}
