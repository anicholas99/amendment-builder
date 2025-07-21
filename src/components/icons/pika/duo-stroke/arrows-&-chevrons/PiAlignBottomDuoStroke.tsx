import React from 'react';

/**
 * PiAlignBottomDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiAlignBottomDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignBottomDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'align-bottom icon',
  ...props
}: PiAlignBottomDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 20h14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.917 11.97a20.8 20.8 0 0 0 3.679 3.885A.64.64 0 0 0 12 16m4.083-4.03a20.8 20.8 0 0 1-3.678 3.885A.64.64 0 0 1 12 16m0 0V4" fill="none"/>
    </svg>
  );
}
