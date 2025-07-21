import React from 'react';

/**
 * PiLinkBrokenSlantDuoStroke icon from the duo-stroke style in development category.
 */
interface PiLinkBrokenSlantDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLinkBrokenSlantDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'link-broken-slant icon',
  ...props
}: PiLinkBrokenSlantDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5.446 10.957-.707.707a5 5 0 0 0 7.071 7.071l.707-.707m-2.12-12.02.706-.708a5 5 0 0 1 7.071 7.071l-.707.707" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.911 7.422h-3M7.74 4.593v-3m8.4 17.057v3m2.828-5.829h3" fill="none"/>
    </svg>
  );
}
