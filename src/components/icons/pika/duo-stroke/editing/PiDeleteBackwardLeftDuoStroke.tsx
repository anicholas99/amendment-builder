import React from 'react';

/**
 * PiDeleteBackwardLeftDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiDeleteBackwardLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDeleteBackwardLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'delete-backward-left icon',
  ...props
}: PiDeleteBackwardLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.206 11.307a33 33 0 0 1 4.42-5.287c.357-.345.536-.518.784-.667.207-.123.476-.232.71-.287C8.402 5 8.681 5 9.24 5H17c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093C21 6.9 21 7.6 21 9v6c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092C19.1 19 18.4 19 17 19H9.239c-.558 0-.837 0-1.119-.066a2.7 2.7 0 0 1-.71-.287c-.248-.148-.427-.321-.785-.667a33 33 0 0 1-4.419-5.287A1.24 1.24 0 0 1 2 12c0-.245.069-.49.206-.693Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 15-3-3m0 0-3-3m3 3 3-3m-3 3-3 3" fill="none"/>
    </svg>
  );
}
