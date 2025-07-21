import React from 'react';

/**
 * PiDivertLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiDivertLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDivertLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'divert-left icon',
  ...props
}: PiDivertLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m22 9-6.879 6.879a3 3 0 0 1-4.242 0L3.295 8.295" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8.289a20.8 20.8 0 0 0-5.347-.202.625.625 0 0 0-.566.566A20.8 20.8 0 0 0 3.29 14" fill="none"/>
    </svg>
  );
}
