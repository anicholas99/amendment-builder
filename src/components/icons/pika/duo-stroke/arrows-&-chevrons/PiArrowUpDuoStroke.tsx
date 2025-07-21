import React from 'react';

/**
 * PiArrowUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-up icon',
  ...props
}: PiArrowUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9.83a30.2 30.2 0 0 1 5.406-5.62.95.95 0 0 1 1.188 0A30.2 30.2 0 0 1 18 9.83" fill="none"/>
    </svg>
  );
}
