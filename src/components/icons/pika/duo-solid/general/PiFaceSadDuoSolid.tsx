import React from 'react';

/**
 * PiFaceSadDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceSadDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceSadDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-sad icon',
  ...props
}: PiFaceSadDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M9 8.687a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M16.266 16.814a1 1 0 0 1-1.414-.014 4 4 0 0 0-2.857-1.2 3.98 3.98 0 0 0-2.856 1.2 1 1 0 0 1-1.428-1.4 6 6 0 0 1 4.284-1.8c1.679 0 3.198.69 4.285 1.8a1 1 0 0 1-.014 1.414Z"/><path fill={color || "currentColor"} d="M16 9.687a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z"/>
    </svg>
  );
}
