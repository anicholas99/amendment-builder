import React from 'react';

/**
 * PiHeartSupportDuoStroke icon from the duo-stroke style in general category.
 */
interface PiHeartSupportDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeartSupportDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'heart-support icon',
  ...props
}: PiHeartSupportDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5.427C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21c.737 0 5.817-2.727 8.44-6.976" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 8.944c0-5.437-6.838-8.282-10-3.517l-2.81 3.56a2.168 2.168 0 0 0 3.334 2.771L14.5 9.5a9.66 9.66 0 0 0 5.94 4.524c.937-1.518 1.56-3.23 1.56-5.08Z" fill="none"/>
    </svg>
  );
}
