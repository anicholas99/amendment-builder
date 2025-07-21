import React from 'react';

/**
 * PiCycleCyclingDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiCycleCyclingDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCycleCyclingDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cycle-cycling icon',
  ...props
}: PiCycleCyclingDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M1.5 17.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/><path fill={color || "currentColor"} d="M14.5 17.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/></g><path fill={color || "currentColor"} d="M14.5 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"/><path fill={color || "currentColor"} d="M9.734 9.85a2.02 2.02 0 0 1 2.586.08l1.142 1.03a5 5 0 0 0 2.527 1.219l1.847.307a1 1 0 1 0 .328-1.972l-1.847-.308a3 3 0 0 1-1.515-.731l-1.143-1.03c-1.448-1.306-3.632-1.362-5.156-.17-1.911 1.493-1.383 4.585 1 5.266l1.363.389a1 1 0 0 1 .695 1.204l-1.031 4.123a1 1 0 1 0 1.94.486l1.031-4.124a3 3 0 0 0-2.086-3.612l-1.362-.39c-.76-.216-.984-1.247-.319-1.766Z"/>
    </svg>
  );
}
