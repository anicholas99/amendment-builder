import React from 'react';

/**
 * PiFaceEvilSmileDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceEvilSmileDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceEvilSmileDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-evil-smile icon',
  ...props
}: PiFaceEvilSmileDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M10.424 10.473a1 1 0 0 0-.246-1.393l-1.229-.86a1 1 0 1 0-1.147 1.638l1.229.86a1 1 0 0 0 1.393-.245Z"/><path fill={color || "currentColor"} d="M7.73 13.885a1 1 0 0 1 1.413.014A4 4 0 0 0 12 15.1c1.119 0 2.13-.458 2.857-1.2a1 1 0 1 1 1.428 1.4A6 6 0 0 1 12 17.1a6 6 0 0 1-4.285-1.8 1 1 0 0 1 .014-1.414Z"/><path fill={color || "currentColor"} d="M14.97 10.719a1 1 0 0 1-1.148-1.639l1.229-.86a1 1 0 0 1 1.147 1.638z"/>
    </svg>
  );
}
