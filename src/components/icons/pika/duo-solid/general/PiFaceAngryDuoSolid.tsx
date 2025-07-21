import React from 'react';

/**
 * PiFaceAngryDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceAngryDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceAngryDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-angry icon',
  ...props
}: PiFaceAngryDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M10.334 10.474a1 1 0 0 0-.246-1.393l-1.229-.86a1 1 0 0 0-1.147 1.638l1.229.86a1 1 0 0 0 1.393-.245Z"/><path fill={color || "currentColor"} d="M13.667 10.474a1 1 0 0 0 1.392.245l1.229-.86a1 1 0 0 0-1.147-1.639l-1.229.86a1 1 0 0 0-.246 1.394Z"/><path fill={color || "currentColor"} d="M14.852 16.8a1 1 0 0 0 1.428-1.4 5.98 5.98 0 0 0-4.285-1.8c-1.678 0-3.196.69-4.284 1.8a1 1 0 1 0 1.428 1.4 4 4 0 0 1 2.857-1.2c1.119 0 2.129.458 2.856 1.2Z"/>
    </svg>
  );
}
