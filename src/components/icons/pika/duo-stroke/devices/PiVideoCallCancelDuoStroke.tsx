import React from 'react';

/**
 * PiVideoCallCancelDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiVideoCallCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVideoCallCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'video-call-cancel icon',
  ...props
}: PiVideoCallCancelDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.001 13.934a2 2 0 0 0 .713 1.465l1 .84c1.3 1.093 3.286.168 3.286-1.531V9.292c0-1.7-1.985-2.624-3.286-1.531l-1 .84A2 2 0 0 0 17 10.059m0 3.875V15a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4l.001 1.059m0 3.875v-3.875" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 14.5 9.5 12m0 0L12 9.5M9.5 12 7 9.5M9.5 12l2.5 2.5" fill="none"/>
    </svg>
  );
}
