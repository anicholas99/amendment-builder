import React from 'react';

/**
 * PiHeadingH5DuoStroke icon from the duo-stroke style in editing category.
 */
interface PiHeadingH5DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeadingH5DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'heading-h5 icon',
  ...props
}: PiHeadingH5DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h8m-8 6V6m8 12V6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.5 10h-3a1.5 1.5 0 0 0-1.5 1.5V14h3a2 2 0 1 1 0 4h-3" fill="none"/>
    </svg>
  );
}
