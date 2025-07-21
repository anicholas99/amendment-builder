import React from 'react';

/**
 * PiArrowBigRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowBigRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-right icon',
  ...props
}: PiArrowBigRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.195 5q.232 1.995.33 4H4.603c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054v2.8c0 .56 0 .84.11 1.054a1 1 0 0 0 .436.437c.214.109.494.109 1.054.109h9.924a61 61 0 0 1-.33 4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.196 5a35.3 35.3 0 0 1 6.557 6.307 1.11 1.11 0 0 1 0 1.386A35.3 35.3 0 0 1 14.196 19" fill="none"/>
    </svg>
  );
}
