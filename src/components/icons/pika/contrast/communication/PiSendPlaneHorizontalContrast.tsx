import React from 'react';

/**
 * PiSendPlaneHorizontalContrast icon from the contrast style in communication category.
 */
interface PiSendPlaneHorizontalContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSendPlaneHorizontalContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'send-plane-horizontal icon',
  ...props
}: PiSendPlaneHorizontalContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4.934 12 3.09 5.732c-.481-1.635 1.05-3.147 2.665-2.628a54 54 0 0 1 12.64 5.963C19.525 9.793 21 10.442 21 12s-1.474 2.207-2.605 2.933a54 54 0 0 1-12.64 5.963c-1.614.519-3.146-.993-2.665-2.628z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.934 12 3.09 5.732c-.481-1.635 1.05-3.147 2.665-2.628a54 54 0 0 1 12.64 5.963C19.525 9.793 21 10.442 21 12s-1.474 2.207-2.605 2.933a54 54 0 0 1-12.64 5.963c-1.614.519-3.146-.993-2.665-2.628zm0 0h4.9" fill="none"/>
    </svg>
  );
}
