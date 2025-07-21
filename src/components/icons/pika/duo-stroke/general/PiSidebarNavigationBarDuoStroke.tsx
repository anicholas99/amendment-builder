import React from 'react';

/**
 * PiSidebarNavigationBarDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSidebarNavigationBarDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSidebarNavigationBarDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sidebar-navigation-bar icon',
  ...props
}: PiSidebarNavigationBarDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3.01v17.98" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.011 9C3 9.577 3 10.236 3 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185c.778.396 1.73.505 3.27.534.577.011 1.236.011 2 .011h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-.764 0-1.423-.011-2M3.011 9c.03-1.54.138-2.492.534-3.27A5 5 0 0 1 5.73 3.545c.778-.396 1.73-.504 3.27-.534C9.577 3 10.236 3 11 3h2c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185c.396.778.505 1.73.534 3.27M3.011 9H20.99" fill="none"/>
    </svg>
  );
}
