import React from 'react';

/**
 * PiThreeDotsMenuVerticalCircleDuoSolid icon from the duo-solid style in general category.
 */
interface PiThreeDotsMenuVerticalCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreeDotsMenuVerticalCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'three-dots-menu-vertical-circle icon',
  ...props
}: PiThreeDotsMenuVerticalCircleDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M22.15 12.002c0 5.605-4.544 10.15-10.15 10.15S1.85 17.607 1.85 12.002 6.394 1.852 12 1.852s10.15 4.544 10.15 10.15Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.005 7.994v.01m0 3.99v.01m0 3.99v.01"/>
    </svg>
  );
}
