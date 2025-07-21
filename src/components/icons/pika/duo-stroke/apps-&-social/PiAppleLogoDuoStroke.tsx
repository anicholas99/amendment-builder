import React from 'react';

/**
 * PiAppleLogoDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiAppleLogoDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAppleLogoDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'apple-logo icon',
  ...props
}: PiAppleLogoDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.161 10.199a4.34 4.34 0 0 0-3.433-1.78c-1.472-.187-2.845.843-3.63.843s-1.864-.842-3.139-.749c-2.256 0-4.807 1.78-4.807 5.338 0 3.84 3.14 8.241 5.101 8.148 1.276 0 1.57-.75 3.041-.75 1.472 0 1.766.75 3.14.75 1.863 0 3.727-2.997 4.414-4.683-3.14-1.592-3.532-5.338-.687-7.117Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.755 2c-3.638 0-4.684 2.093-4.657 4.176 3.112.01 4.681-2.083 4.657-4.176Z" fill="none"/>
    </svg>
  );
}
