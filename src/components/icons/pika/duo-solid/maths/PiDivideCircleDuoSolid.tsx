import React from 'react';

/**
 * PiDivideCircleDuoSolid icon from the duo-solid style in maths category.
 */
interface PiDivideCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDivideCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'divide-circle icon',
  ...props
}: PiDivideCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M12 6.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z"/><path fill={color || "currentColor"} d="M12 14.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z"/><path fill={color || "currentColor"} d="M7.9 11a1 1 0 1 0 0 2h8.2a1 1 0 0 0 0-2z"/>
    </svg>
  );
}
