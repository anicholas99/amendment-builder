import React from 'react';

/**
 * PiHeartDuoStroke icon from the duo-stroke style in general category.
 */
interface PiHeartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'heart icon',
  ...props
}: PiHeartDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21c1 0 10-5.023 10-12.056 0-5.437-6.837-8.282-10-3.517C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 8.944C2 3.502 8.832.654 12 5.427c3.162-4.765 10-1.92 10 3.517" fill="none"/>
    </svg>
  );
}
