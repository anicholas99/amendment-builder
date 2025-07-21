import React from 'react';

/**
 * PiHeadingH1DuoStroke icon from the duo-stroke style in editing category.
 */
interface PiHeadingH1DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeadingH1DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'heading-h1 icon',
  ...props
}: PiHeadingH1DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h8m-8 6V6m8 12V6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 18v-8c-.962.236-1.698.898-2.134 1.771M19 18h-2.5m2.5 0h2.5" fill="none"/>
    </svg>
  );
}
