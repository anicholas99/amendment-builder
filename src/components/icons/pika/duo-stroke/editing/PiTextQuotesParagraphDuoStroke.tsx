import React from 'react';

/**
 * PiTextQuotesParagraphDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiTextQuotesParagraphDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTextQuotesParagraphDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'text-quotes-paragraph icon',
  ...props
}: PiTextQuotesParagraphDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 20h18" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14h18" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7h4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.5 7H5a1 1 0 0 1 0 2h-.5A1.5 1.5 0 0 1 3 7.5V6.4A2.4 2.4 0 0 1 5.4 4" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.5 7H12a1 1 0 1 1 0 2h-.5A1.5 1.5 0 0 1 10 7.5V6.4A2.4 2.4 0 0 1 12.4 4" fill="none"/>
    </svg>
  );
}
