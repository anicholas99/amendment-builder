import React from 'react';

/**
 * PiSidebarNavigationBarContrast icon from the contrast style in general category.
 */
interface PiSidebarNavigationBarContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSidebarNavigationBarContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'sidebar-navigation-bar icon',
  ...props
}: PiSidebarNavigationBarContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M13 3h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 5.73C3.148 6.508 3.04 7.46 3.01 9h17.978c-.03-1.54-.138-2.492-.534-3.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3.011C9.577 3 10.236 3 11 3h2c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185c.396.778.505 1.73.534 3.27M9 3.011c-1.54.03-2.492.138-3.27.534A5 5 0 0 0 3.545 5.73c-.396.778-.504 1.73-.534 3.27M9 3.011V9M3.011 9C3 9.577 3 10.236 3 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185c.778.396 1.73.505 3.27.534M3.011 9H9m0 0v11.989M9 9h11.989M9 20.989C9.577 21 10.236 21 11 21h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-.764 0-1.423-.011-2" fill="none"/>
    </svg>
  );
}
