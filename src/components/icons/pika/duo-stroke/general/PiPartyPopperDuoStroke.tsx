import React from 'react';

/**
 * PiPartyPopperDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPartyPopperDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPartyPopperDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'party-popper icon',
  ...props
}: PiPartyPopperDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.125 17.966C13 19 4.323 22.593 2.88 21.087 1.434 19.575 5 11 6.034 9.875M16 12h.01M22 17c-1.096-1.827-3.034-2.281-5-2m-6.5-7.5c.629-1.886.215-3.965-1.033-5.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 4.35c-3.378 1.013-6.354 2.789-8.5 5.65m4.5 9h.01M6 5h.01M14 4h.01M21 10h.01M6.264 9.25c.781-.78 3.314.486 5.657 2.829s3.61 4.875 2.829 5.656c-.15.15-.362.224-.625.23-1.116.03-3.136-1.162-5.032-3.058s-3.087-3.916-3.059-5.032c.007-.263.081-.476.23-.625Z" fill="none"/>
    </svg>
  );
}
