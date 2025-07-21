import React from 'react';

/**
 * PiStoreAltDuoStroke icon from the duo-stroke style in building category.
 */
interface PiStoreAltDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStoreAltDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'store-alt icon',
  ...props
}: PiStoreAltDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-7.257m-16 0V18.6c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163h5.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.58v-5.184" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2.25 10.467.314-3.145C2.88 4.15 3.968 3 7.34 3h9.319c3.371 0 4.459 1.15 4.776 4.322l.315 3.145c.098 1.902-1.226 3.636-3.238 3.636a3.256 3.256 0 0 1-3.255-3.256 3.256 3.256 0 1 1-6.512 0 3.256 3.256 0 0 1-3.256 3.256c-2.02 0-3.325-1.735-3.24-3.636Z" fill="none"/>
    </svg>
  );
}
