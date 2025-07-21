import React from 'react';

/**
 * PiScribbleDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScribbleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScribbleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scribble icon',
  ...props
}: PiScribbleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.294C6.588 7.09 12.05 4.307 17.514 3.03c1.118-.261 1.753 1.234.789 1.858-3.946 2.55-8.186 5.744-11.089 9.453-.352.338.061.903.49.67 3.588-1.944 7.48-4.187 11.694-3.926.543.034.7.76.218 1.014-3.495 1.726-6.256 3.63-8.45 6.17-.718.636-.026 1.794.873 1.462 1.802-.713 6.623-3.832 7.82-.878" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.294C6.588 7.09 12.05 4.307 17.514 3.03c1.118-.261 1.753 1.234.789 1.858-3.946 2.55-8.186 5.744-11.089 9.453-.352.338.061.903.49.67 1.697-.92 3.462-1.905 5.296-2.662" fill="none"/>
    </svg>
  );
}
