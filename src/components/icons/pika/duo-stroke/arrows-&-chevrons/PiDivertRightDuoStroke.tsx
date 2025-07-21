import React from 'react';

/**
 * PiDivertRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiDivertRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDivertRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'divert-right icon',
  ...props
}: PiDivertRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 9 6.879 6.879a3 3 0 0 0 4.242 0l7.584-7.584" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 8.289a20.8 20.8 0 0 1 5.347-.202.625.625 0 0 1 .566.566A20.8 20.8 0 0 1 20.71 14" fill="none"/>
    </svg>
  );
}
