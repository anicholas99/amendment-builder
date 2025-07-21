import React from 'react';

/**
 * PiHeartBreakDuoStroke icon from the duo-stroke style in general category.
 */
interface PiHeartBreakDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeartBreakDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'heart-break icon',
  ...props
}: PiHeartBreakDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16c-1.155-1.059-1.74-2.435-1.992-3.952a.08.08 0 0 1 .032-.074l2.896-1.931a.12.12 0 0 0 .049-.118A11.5 11.5 0 0 0 12 5.428" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 8.944C2 15.977 11 21 12 21s10-5.023 10-12.056c0-5.437-6.837-8.282-10-3.517C8.832.653 2 3.502 2 8.944Z" fill="none"/>
    </svg>
  );
}
