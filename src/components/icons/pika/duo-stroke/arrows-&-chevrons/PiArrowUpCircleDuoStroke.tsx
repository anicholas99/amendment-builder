import React from 'react';

/**
 * PiArrowUpCircleDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowUpCircleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowUpCircleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-up-circle icon',
  ...props
}: PiArrowUpCircleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11.949a20.3 20.3 0 0 1 3.604-3.807A.63.63 0 0 1 12 8m4 3.949a20.3 20.3 0 0 0-3.604-3.807A.63.63 0 0 0 12 8m0 0v8" fill="none"/>
    </svg>
  );
}
