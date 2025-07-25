import React from 'react';

/**
 * PiEqualsCircleContrast icon from the contrast style in maths category.
 */
interface PiEqualsCircleContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEqualsCircleContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'equals-circle icon',
  ...props
}: PiEqualsCircleContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M21.15 12a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6m-6 4h6m6.15-2a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z" fill="none"/>
    </svg>
  );
}
