import React from 'react';

/**
 * PiFaceWink02DuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceWink02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceWink02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-wink-02 icon',
  ...props
}: PiFaceWink02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M10 9.9a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z"/><path fill={color || "currentColor"} d="M13.6 10.4a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M7.73 13.887a1 1 0 0 1 1.413.013A4 4 0 0 0 12 15.1c1.12 0 2.13-.458 2.857-1.2a1 1 0 0 1 1.428 1.4A6 6 0 0 1 12 17.1a6 6 0 0 1-4.285-1.8 1 1 0 0 1 .014-1.414Z"/>
    </svg>
  );
}
