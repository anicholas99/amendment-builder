import React from 'react';

/**
 * PiThreeDotsMenuVerticalCircleDuoStroke icon from the duo-stroke style in general category.
 */
interface PiThreeDotsMenuVerticalCircleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreeDotsMenuVerticalCircleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'three-dots-menu-vertical-circle icon',
  ...props
}: PiThreeDotsMenuVerticalCircleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.005 7.994v.01m0 3.99v.01m0 3.99v.01" fill="none"/>
    </svg>
  );
}
