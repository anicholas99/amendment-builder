import React from 'react';

/**
 * PiServerExclamationMarkDuoSolid icon from the duo-solid style in development category.
 */
interface PiServerExclamationMarkDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerExclamationMarkDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'server-exclamation-mark icon',
  ...props
}: PiServerExclamationMarkDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M5.4 3A3.4 3.4 0 0 0 2 6.4v1.2A3.4 3.4 0 0 0 5.4 11h13.2A3.4 3.4 0 0 0 22 7.6V6.4A3.4 3.4 0 0 0 18.6 3z"/><path fill={color || "currentColor"} d="M5.4 13A3.4 3.4 0 0 0 2 16.4v1.2A3.4 3.4 0 0 0 5.4 21h10.77q.094-.263.231-.5A3 3 0 0 1 16 19v-4c0-.768.289-1.47.764-2z"/></g><path fill={color || "currentColor"} d="M13 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/><path fill={color || "currentColor"} d="M17 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/><path fill={color || "currentColor"} d="M13 17a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M20 22a1 1 0 1 1-2 0v-.001a1 1 0 0 1 2 0z"/><path fill={color || "currentColor"} d="M20 19a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0z"/>
    </svg>
  );
}
