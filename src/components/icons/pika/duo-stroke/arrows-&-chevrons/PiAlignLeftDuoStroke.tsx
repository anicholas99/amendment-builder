import React from 'react';

/**
 * PiAlignLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiAlignLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'align-left icon',
  ...props
}: PiAlignLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5v14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.03 7.917a20.8 20.8 0 0 0-3.885 3.679A.64.64 0 0 0 8 12m4.03 4.083a20.8 20.8 0 0 1-3.885-3.678A.64.64 0 0 1 8 12m0 0h12" fill="none"/>
    </svg>
  );
}
