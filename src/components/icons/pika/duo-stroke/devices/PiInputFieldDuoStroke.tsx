import React from 'react';

/**
 * PiInputFieldDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiInputFieldDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInputFieldDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'input-field icon',
  ...props
}: PiInputFieldDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7H7c-.93 0-1.394 0-1.78.077a4 4 0 0 0-3.143 3.143C2 10.606 2 11.07 2 12s0 1.394.077 1.78a4 4 0 0 0 3.143 3.143C5.606 17 6.07 17 7 17h10m3-9.464a4 4 0 0 1 1.923 2.684c.077.386.077.85.077 1.78s0 1.394-.077 1.78A4 4 0 0 1 20 16.464" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7v10m0-10c0-.93 0-1.395-.102-1.776a3 3 0 0 0-2.121-2.122C14.395 3 13.93 3 13 3m4 4c0-.93 0-1.395.102-1.776a3 3 0 0 1 2.122-2.122C19.605 3 20.07 3 21 3m-4 14c0 .93 0 1.395-.102 1.776a3 3 0 0 1-2.121 2.122C14.395 21 13.93 21 13 21m4-4c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.122 2.122C19.605 21 20.07 21 21 21M7 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/>
    </svg>
  );
}
