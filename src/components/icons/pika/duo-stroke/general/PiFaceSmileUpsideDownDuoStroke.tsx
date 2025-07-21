import React from 'react';

/**
 * PiFaceSmileUpsideDownDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFaceSmileUpsideDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceSmileUpsideDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'face-smile-upside-down icon',
  ...props
}: PiFaceSmileUpsideDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12.196a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 14.496v-1m-6 1v-1m6.57-3.5a5 5 0 0 0-3.57-1.5 5 5 0 0 0-3.57 1.5" fill="none"/>
    </svg>
  );
}
