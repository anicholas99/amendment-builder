import React from 'react';

/**
 * PiThreeDotsMenuHorizontalCircleDuoSolid icon from the duo-solid style in general category.
 */
interface PiThreeDotsMenuHorizontalCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreeDotsMenuHorizontalCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'three-dots-menu-horizontal-circle icon',
  ...props
}: PiThreeDotsMenuHorizontalCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01"/>
    </svg>
  );
}
