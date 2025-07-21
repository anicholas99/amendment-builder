import React from 'react';

/**
 * PiTextQuotesOpenDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiTextQuotesOpenDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTextQuotesOpenDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'text-quotes-open icon',
  ...props
}: PiTextQuotesOpenDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 13.999a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13.999a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 13.999A9.4 9.4 0 0 1 18 6.3M4 14a9.4 9.4 0 0 1 4-7.7" opacity=".28" fill="none"/>
    </svg>
  );
}
