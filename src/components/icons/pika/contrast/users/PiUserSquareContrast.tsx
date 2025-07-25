import React from 'react';

/**
 * PiUserSquareContrast icon from the contrast style in users category.
 */
interface PiUserSquareContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserSquareContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'user-square icon',
  ...props
}: PiUserSquareContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M16 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.767 20.165a1.7 1.7 0 0 0 .207-.808A3.357 3.357 0 0 0 15.617 16H8.383a3.357 3.357 0 0 0-3.357 3.357c0 .293.075.568.207.808m13.534 0a5 5 0 0 0 1.688-1.895C21 17.2 21 15.8 21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 5.73C3 6.8 3 8.2 3 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 1.688 1.895m13.534 0q-.24.159-.497.29C17.2 21 15.8 21 13 21h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-.497-.29M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/>
    </svg>
  );
}
