import React from 'react';

/**
 * PiFaceOldDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceOldDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceOldDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-old icon',
  ...props
}: PiFaceOldDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M13.58 8.557a1 1 0 0 1 1.393-.246l1.23.86a1 1 0 0 1-1.148 1.639l-1.229-.86a1 1 0 0 1-.245-1.393Z"/><path fill={color || "currentColor"} d="M10.428 8.557a1 1 0 0 1-.246 1.393l-1.228.86a1 1 0 0 1-1.148-1.638l1.23-.86a1 1 0 0 1 1.392.245Z"/><path fill={color || "currentColor"} d="M9.143 13.9a1 1 0 1 0-1.428 1.4A6 6 0 0 0 12 17.1c1.678 0 3.197-.69 4.285-1.8a1 1 0 1 0-1.429-1.4A4 4 0 0 1 12 15.1c-1.12 0-2.13-.458-2.857-1.2Z"/>
    </svg>
  );
}
