import React from 'react';

/**
 * PiSwipeDefaultDuoSolid icon from the duo-solid style in general category.
 */
interface PiSwipeDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwipeDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'swipe-default icon',
  ...props
}: PiSwipeDefaultDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M15.211 3.394a1 1 0 1 0-.422 1.955c2.06.445 3.968 1.3 5.635 2.475a1 1 0 1 0 1.152-1.634 17.4 17.4 0 0 0-6.365-2.796Z"/><path fill={color || "currentColor"} d="M5.394 6.247a1 1 0 0 0-.788-1.838 17.5 17.5 0 0 0-3.182 1.78 1 1 0 0 0 1.152 1.634 15.5 15.5 0 0 1 2.818-1.576Z"/></g><path fill={color || "currentColor"} d="M7.006 3.998a3 3 0 1 1 6 0v5.153l3.972.662c1.072.179 1.94.628 2.592 1.29.647.653 1.037 1.466 1.246 2.307.41 1.658.148 3.548-.414 5.046-1.082 2.884-4.011 4.377-6.861 4.617-2.848.24-6.006-.733-7.648-3.26L1.65 13.285a1.79 1.79 0 0 1 .7-2.577 4.16 4.16 0 0 1 4.656.637z"/>
    </svg>
  );
}
