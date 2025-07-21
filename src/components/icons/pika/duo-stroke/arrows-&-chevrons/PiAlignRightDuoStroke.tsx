import React from 'react';

/**
 * PiAlignRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiAlignRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'align-right icon',
  ...props
}: PiAlignRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 5v14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.97 7.917a20.8 20.8 0 0 1 3.885 3.679A.64.64 0 0 1 16 12m-4.03 4.083a20.8 20.8 0 0 0 3.885-3.678A.64.64 0 0 0 16 12m0 0H4" fill="none"/>
    </svg>
  );
}
