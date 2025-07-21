import React from 'react';

/**
 * PiSidebarRightCloseDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSidebarRightCloseDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSidebarRightCloseDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sidebar-right-close icon',
  ...props
}: PiSidebarRightCloseDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 20.989C14.423 21 13.764 21 13 21h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C3 17.2 3 15.8 3 13v-2c0-2.8 0-4.2.545-5.27A5 5 0 0 1 5.73 3.545C6.8 3 8.2 3 11 3h2c.764 0 1.423 0 2 .011" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 9a15.3 15.3 0 0 1 2.92 2.777.354.354 0 0 1 0 .447 15.3 15.3 0 0 1-2.92 2.777M21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185c-.778-.397-1.73-.505-3.27-.534V20.99c1.54-.03 2.492-.138 3.27-.534a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13Z" fill="none"/>
    </svg>
  );
}
