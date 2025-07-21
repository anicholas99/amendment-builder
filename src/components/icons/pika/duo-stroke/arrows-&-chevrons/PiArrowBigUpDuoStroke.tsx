import React from 'react';

/**
 * PiArrowBigUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowBigUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-up icon',
  ...props
}: PiArrowBigUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9.805a61 61 0 0 0-4-.33v9.923c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437c-.214.109-.494.109-1.054.109h-2.8c-.56 0-.84 0-1.054-.11a1 1 0 0 1-.437-.436C9 20.238 9 19.958 9 19.398V9.475q-2.005.099-4 .33" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9.805a35.3 35.3 0 0 0-6.307-6.558 1.11 1.11 0 0 0-1.386 0A35.3 35.3 0 0 0 5 9.805" fill="none"/>
    </svg>
  );
}
