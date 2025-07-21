import React from 'react';

/**
 * PiPollDuoSolid icon from the duo-solid style in general category.
 */
interface PiPollDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPollDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'poll icon',
  ...props
}: PiPollDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M2 17a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/><path fill={color || "currentColor"} d="M12 17a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z"/></g><path fill={color || "currentColor"} d="M6 5.9a1.1 1.1 0 0 0 0 2.2h.01a1.1 1.1 0 0 0 0-2.2z"/><path fill={color || "currentColor"} d="M2 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill={color || "currentColor"} d="M12 7a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z"/>
    </svg>
  );
}
