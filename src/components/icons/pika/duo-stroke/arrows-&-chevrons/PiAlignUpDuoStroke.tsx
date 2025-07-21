import React from 'react';

/**
 * PiAlignUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiAlignUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'align-up icon',
  ...props
}: PiAlignUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4h14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.917 12.03a20.8 20.8 0 0 1 3.679-3.885A.64.64 0 0 1 12 8m4.083 4.03a20.8 20.8 0 0 0-3.678-3.885A.64.64 0 0 0 12 8m0 0v12" fill="none"/>
    </svg>
  );
}
