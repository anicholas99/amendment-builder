import React from 'react';

/**
 * PiArrowLeftUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowLeftUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-up icon',
  ...props
}: PiArrowLeftUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5.863 5.863 12.728 12.728" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.743 14.229a30.2 30.2 0 0 1-.152-7.797.95.95 0 0 1 .84-.84 30.2 30.2 0 0 1 7.798.151" fill="none"/>
    </svg>
  );
}
