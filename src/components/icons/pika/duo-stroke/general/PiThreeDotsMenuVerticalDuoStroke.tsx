import React from 'react';

/**
 * PiThreeDotsMenuVerticalDuoStroke icon from the duo-stroke style in general category.
 */
interface PiThreeDotsMenuVerticalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreeDotsMenuVerticalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'three-dots-menu-vertical icon',
  ...props
}: PiThreeDotsMenuVerticalDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M12 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/><path d="M12 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="none"/>
    </svg>
  );
}
