import React from 'react';

/**
 * PiLogOutRightContrast icon from the contrast style in general category.
 */
interface PiLogOutRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLogOutRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'log-out-right icon',
  ...props
}: PiLogOutRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20.843 11.556A15 15 0 0 0 18.189 9c.1.994.26 2 .26 3s-.16 2.006-.26 3a15 15 0 0 0 2.654-2.556.704.704 0 0 0 0-.888Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 4.528A6 6 0 0 0 3 9v6a6 6 0 0 0 10 4.472M18.45 12H8m10.45 0c0-1-.162-2.006-.261-3a15 15 0 0 1 2.654 2.556.704.704 0 0 1 0 .888A15 15 0 0 1 18.189 15c.1-.994.26-2 .26-3Z" fill="none"/>
    </svg>
  );
}
