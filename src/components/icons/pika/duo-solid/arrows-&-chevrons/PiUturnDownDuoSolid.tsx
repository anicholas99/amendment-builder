import React from 'react';

/**
 * PiUturnDownDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiUturnDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUturnDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'uturn-down icon',
  ...props
}: PiUturnDownDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16.205V9a5 5 0 0 1 10 0v3" opacity=".28"/><path fill={color || "currentColor"} d="M3.99 14.972a1 1 0 0 0-.882 1.585 21.8 21.8 0 0 0 3.856 4.074 1.64 1.64 0 0 0 2.072 0 21.8 21.8 0 0 0 3.856-4.074 1 1 0 0 0-.882-1.585l-2.32.17a23 23 0 0 1-3.38 0z"/>
    </svg>
  );
}
