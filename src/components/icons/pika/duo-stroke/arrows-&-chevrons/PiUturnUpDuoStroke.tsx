import React from 'react';

/**
 * PiUturnUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiUturnUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUturnUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'uturn-up icon',
  ...props
}: PiUturnUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4v11a5 5 0 0 1-10 0v-3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.083 8.03a20.8 20.8 0 0 0-3.679-3.885.64.64 0 0 0-.809 0 20.8 20.8 0 0 0-3.679 3.886" fill="none"/>
    </svg>
  );
}
