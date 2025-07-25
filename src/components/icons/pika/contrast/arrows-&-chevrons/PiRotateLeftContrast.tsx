import React from 'react';

/**
 * PiRotateLeftContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiRotateLeftContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRotateLeftContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'rotate-left icon',
  ...props
}: PiRotateLeftContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M5.166 6.396A15 15 0 0 1 6.215 2.67l1.237 2.75 1.763 2.446a15 15 0 0 1-3.57-.884c-.264-.101-.528-.251-.479-.586Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.25 14a8 8 0 1 0 3.302-8.652m0 0A24 24 0 0 1 6.457 3.21l-.242-.54a15 15 0 0 0-1.049 3.727c-.049.335.215.485.479.586a15 15 0 0 0 3.57.884l-.346-.48a24 24 0 0 1-1.317-2.038Z" fill="none"/>
    </svg>
  );
}
