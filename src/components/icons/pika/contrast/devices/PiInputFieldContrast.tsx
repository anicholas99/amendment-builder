import React from 'react';

/**
 * PiInputFieldContrast icon from the contrast style in devices category.
 */
interface PiInputFieldContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInputFieldContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'input-field icon',
  ...props
}: PiInputFieldContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M17 7H7c-.93 0-1.394 0-1.78.077a4 4 0 0 0-3.143 3.143C2 10.606 2 11.07 2 12s0 1.394.077 1.78a4 4 0 0 0 3.143 3.143C5.606 17 6.07 17 7 17h10z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17H7c-.93 0-1.394 0-1.78-.077a4 4 0 0 1-3.143-3.143C2 13.394 2 12.93 2 12s0-1.394.077-1.78A4 4 0 0 1 5.22 7.077C5.606 7 6.07 7 7 7h10m0 10V7m0 10c0 .93 0 1.395-.102 1.776a3 3 0 0 1-2.121 2.122C14.395 21 13.93 21 13 21m4-4c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.122 2.122C19.605 21 20.07 21 21 21M17 7c0-.93 0-1.395-.102-1.776a3 3 0 0 0-2.121-2.122C14.395 3 13.93 3 13 3m4 4c0-.93 0-1.395.102-1.776a3 3 0 0 1 2.122-2.122C19.605 3 20.07 3 21 3m0 12.646a4 4 0 0 0 .923-1.866C22 13.394 22 12.93 22 12s0-1.394-.077-1.78A4 4 0 0 0 21 8.354M7 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/>
    </svg>
  );
}
