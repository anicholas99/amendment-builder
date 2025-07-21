import React from 'react';

/**
 * PiSidebarDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSidebarDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSidebarDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sidebar-default icon',
  ...props
}: PiSidebarDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20.989C9.577 21 10.236 21 11 21h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3h-2c-.764 0-1.423 0-2 .011" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185c.778.396 1.73.504 3.27.534V3.01c-1.54.03-2.492.137-3.27.534A5 5 0 0 0 3.545 5.73C3 6.8 3 8.2 3 11Z" fill="none"/>
    </svg>
  );
}
