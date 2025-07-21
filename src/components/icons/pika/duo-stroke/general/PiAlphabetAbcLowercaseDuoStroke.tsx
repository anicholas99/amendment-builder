import React from 'react';

/**
 * PiAlphabetAbcLowercaseDuoStroke icon from the duo-stroke style in general category.
 */
interface PiAlphabetAbcLowercaseDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlphabetAbcLowercaseDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'alphabet-abc-lowercase icon',
  ...props
}: PiAlphabetAbcLowercaseDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.6 15.389a2.4 2.4 0 0 1-4-1.789v-.2a2.4 2.4 0 0 1 4-1.789M9.995 13.4v.2m0-.2a2.4 2.4 0 1 1 4.8 0v.2a2.4 2.4 0 1 1-4.8 0m0-.2V8m0 5.6v2.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.8 13.6a2.4 2.4 0 1 1-4.8 0v-.2a2.4 2.4 0 1 1 4.8 0m0 .2v-.2m0 .2v2.5m0-2.7v-2.5" fill="none"/>
    </svg>
  );
}
