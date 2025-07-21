import React from 'react';

/**
 * PiBotDuoSolid icon from the duo-solid style in users category.
 */
interface PiBotDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBotDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'bot icon',
  ...props
}: PiBotDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13 2a1 1 0 1 0-2 0v4H9.8c-1.668 0-2.748 0-3.654.294a6 6 0 0 0-3.852 3.852C1.999 11.052 2 12.13 2 13.8v.4c0 1.669 0 2.748.294 3.654a6 6 0 0 0 3.852 3.852c.906.295 1.985.294 3.654.294h4.4c1.669 0 2.748 0 3.654-.294a6 6 0 0 0 3.852-3.852c.295-.906.294-1.985.294-3.654v-.4c0-1.669 0-2.748-.294-3.654a6 6 0 0 0-3.852-3.852C16.948 5.999 15.87 6 14.2 6H13z" opacity=".28"/><path fill={color || "currentColor"} d="M9 10.9a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Z"/><path fill={color || "currentColor"} d="M15 10.9a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Z"/>
    </svg>
  );
}
