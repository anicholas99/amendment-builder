import React from 'react';

/**
 * PiScissorsRightCutDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScissorsRightCutDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScissorsRightCutDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scissors-right-cut icon',
  ...props
}: PiScissorsRightCutDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m18.709 19.264-7.389-7.389m0 0 7.389-7.388m-7.389 7.388-3.039 3.039m3.039-3.039L8.281 8.836" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.125 11.875h-1m5 0h-1M8.281 14.914a3.167 3.167 0 1 0-4.478 4.478 3.167 3.167 0 0 0 4.478-4.478Zm0-6.078a3.167 3.167 0 1 0-4.478-4.478A3.167 3.167 0 0 0 8.28 8.836Z" fill="none"/>
    </svg>
  );
}
