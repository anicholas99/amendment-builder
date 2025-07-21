import React from 'react';

/**
 * PiAndroidDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiAndroidDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAndroidDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'android icon',
  ...props
}: PiAndroidDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.814 8.142 4 5m1.814 3.142A9.96 9.96 0 0 1 12 6c2.335 0 4.484.8 6.186 2.142m-12.372 0A9.98 9.98 0 0 0 2 16v1.982q.002.017.018.018h19.964q.017-.002.018-.018V16a9.98 9.98 0 0 0-3.814-7.858m0 0L20 5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/>
    </svg>
  );
}
