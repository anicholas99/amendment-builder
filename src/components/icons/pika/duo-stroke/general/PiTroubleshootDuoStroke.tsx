import React from 'react';

/**
 * PiTroubleshootDuoStroke icon from the duo-stroke style in general category.
 */
interface PiTroubleshootDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTroubleshootDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'troubleshoot icon',
  ...props
}: PiTroubleshootDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.637 14.12 9.879m0 4.243 4.243 4.243m-8.486-4.243-4.242 4.243m0-12.728 4.242 4.242" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a8.97 8.97 0 0 1-2.636 6.364A8.97 8.97 0 0 1 12 21a8.97 8.97 0 0 1-6.364-2.636A8.97 8.97 0 0 1 3 12a8.97 8.97 0 0 1 2.636-6.364A8.97 8.97 0 0 1 12 3a8.97 8.97 0 0 1 6.364 2.636A8.97 8.97 0 0 1 21 12Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 0 1-.879 2.121A3 3 0 0 1 12 15a3 3 0 0 1-2.121-.879A3 3 0 0 1 9 12c0-.828.336-1.578.879-2.121A3 3 0 0 1 12 9a3 3 0 0 1 2.121.879A3 3 0 0 1 15 12Z" fill="none"/>
    </svg>
  );
}
