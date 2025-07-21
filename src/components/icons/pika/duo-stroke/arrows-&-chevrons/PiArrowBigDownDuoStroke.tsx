import React from 'react';

/**
 * PiArrowBigDownDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowBigDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-down icon',
  ...props
}: PiArrowBigDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14.196q-1.995.231-4 .33V4.603c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.11-.494-.11-1.054-.11h-2.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.437C9 3.763 9 4.043 9 4.603v9.923a61 61 0 0 1-4-.33" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14.195a35.3 35.3 0 0 1-6.307 6.558 1.11 1.11 0 0 1-1.386 0A35.3 35.3 0 0 1 5 14.195" fill="none"/>
    </svg>
  );
}
