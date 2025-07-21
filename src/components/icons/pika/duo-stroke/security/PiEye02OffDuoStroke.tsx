import React from 'react';

/**
 * PiEye02OffDuoStroke icon from the duo-stroke style in security category.
 */
interface PiEye02OffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEye02OffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'eye-02-off icon',
  ...props
}: PiEye02OffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14c0-2.187 2.7-7 9-7 1.623 0 3.008.32 4.169.831m3.222 2.434C20.49 11.598 21 13.048 21 14m-8.129-2.871a3 3 0 0 0-3.743 3.743m3.623 2.033a3 3 0 0 0 2.154-2.154" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
