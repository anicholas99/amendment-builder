import React from 'react';

/**
 * PiRotateLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiRotateLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRotateLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'rotate-left icon',
  ...props
}: PiRotateLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.739 7.017A8 8 0 1 1 4.25 14" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.215 2.67a15 15 0 0 0-1.049 3.726c-.049.335.215.485.479.586l.094.035a15 15 0 0 0 3.476.85" fill="none"/>
    </svg>
  );
}
