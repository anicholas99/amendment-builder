import React from 'react';

/**
 * PiPartyPopperContrast icon from the contrast style in general category.
 */
interface PiPartyPopperContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPartyPopperContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'party-popper icon',
  ...props
}: PiPartyPopperContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M9.093 14.907c1.896 1.896 3.916 3.087 5.032 3.059C13 19 4.323 22.593 2.88 21.086 1.434 19.577 5 11 6.034 9.876c-.028 1.116 1.163 3.136 3.059 5.032Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.125 17.966c.263-.007.476-.082.625-.23.78-.782-.486-3.314-2.829-5.657S7.046 8.469 6.264 9.25c-.149.15-.223.362-.23.625m8.09 8.09c-1.115.03-3.135-1.162-5.031-3.058s-3.087-3.916-3.059-5.032m8.09 8.09C13 19 4.325 22.594 2.882 21.088 1.434 19.575 5 11 6.034 9.875M6 5h.01M14 4h.01M9.467 2c1.248 1.535 1.662 3.614 1.033 5.5M17 15c1.966-.28 3.904.173 5 2m0-12.65c-3.378 1.013-6.354 2.789-8.5 5.65m2.5 2h.01M18 19h.01M21 10h.01" fill="none"/>
    </svg>
  );
}
