import React from 'react';

/**
 * PiFoodMenuBookDuoStroke icon from the duo-stroke style in food category.
 */
interface PiFoodMenuBookDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFoodMenuBookDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'food-menu-book icon',
  ...props
}: PiFoodMenuBookDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.011 16C3 15.423 3 14.764 3 14v-4c0-.764 0-1.423.011-2m0 8c.03 1.54.138 2.492.534 3.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73c-.396.778-.504 1.73-.534 3.27m0 8H2m1.011 0H4m-.989-8H2m1.011 0H4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12v-1a4 4 0 0 0-4-4m4 5H8m8 0h1m-9 0v-1a4 4 0 0 1 4-4m-4 5H7m5-5V6M9 16h6" fill="none"/>
    </svg>
  );
}
