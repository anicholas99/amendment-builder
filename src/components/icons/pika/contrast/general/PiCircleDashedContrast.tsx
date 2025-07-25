import React from 'react';

/**
 * PiCircleDashedContrast icon from the contrast style in general category.
 */
interface PiCircleDashedContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCircleDashedContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'circle-dashed icon',
  ...props
}: PiCircleDashedContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.85 12a9.15 9.15 0 1 0 18.3 0 9.15 9.15 0 0 0-18.3 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.262 3.017a9.1 9.1 0 0 1 3.476 0m3.384 1.4a9.1 9.1 0 0 1 2.461 2.47m1.4 3.375a9.1 9.1 0 0 1 0 3.476m-1.4 3.384a9.1 9.1 0 0 1-2.47 2.46m-3.375 1.4a9.1 9.1 0 0 1-3.476 0m-3.384-1.4a9.1 9.1 0 0 1-2.46-2.47m-1.4-3.374a9.1 9.1 0 0 1 0-3.476m1.4-3.385a9.1 9.1 0 0 1 2.47-2.46" fill="none"/>
    </svg>
  );
}
