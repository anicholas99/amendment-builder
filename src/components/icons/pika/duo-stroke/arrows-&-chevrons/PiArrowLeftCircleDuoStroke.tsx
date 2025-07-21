import React from 'react';

/**
 * PiArrowLeftCircleDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowLeftCircleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftCircleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-circle icon',
  ...props
}: PiArrowLeftCircleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.15 12a9.15 9.15 0 1 0-18.3 0 9.15 9.15 0 0 0 18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.949 16a20.3 20.3 0 0 1-3.807-3.604A.63.63 0 0 1 8 12m3.949-4a20.3 20.3 0 0 0-3.807 3.604A.63.63 0 0 0 8 12m0 0h8" fill="none"/>
    </svg>
  );
}
