import React from 'react';

/**
 * PiThreeDotsMenuHorizontalCircleContrast icon from the contrast style in general category.
 */
interface PiThreeDotsMenuHorizontalCircleContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreeDotsMenuHorizontalCircleContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'three-dots-menu-horizontal-circle icon',
  ...props
}: PiThreeDotsMenuHorizontalCircleContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M21.15 12a9.15 9.15 0 1 0-18.3 0 9.15 9.15 0 0 0 18.3 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M12 2.85a9.15 9.15 0 1 1 0 18.3 9.15 9.15 0 0 1 0-18.3Z" fill="none"/>
    </svg>
  );
}
