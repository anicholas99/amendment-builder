import React from 'react';

/**
 * PiTruckDefaultContrast icon from the contrast style in automotive category.
 */
interface PiTruckDefaultContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTruckDefaultContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'truck-default icon',
  ...props
}: PiTruckDefaultContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M11.8 5.5H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 7.02 2 7.58 2 8.7v6.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.564.287 1.298.216 1.908.218a2 2 0 1 1 4 0h6v-10c0-.988-.013-1.506-.218-1.908a2 2 0 0 0-.874-.874C13.48 5.5 12.92 5.5 11.8 5.5Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18.5v-10m0 10a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m-4 0H9m10 0c.61-.002 1.344.07 1.908-.218a2 2 0 0 0 .874-.874C22 16.98 22 16.42 22 15.3v-1.8l-1.195-2.988c-.29-.727-.436-1.09-.679-1.357a2 2 0 0 0-.781-.529c-.338-.126-.73-.126-1.511-.126H15m-6 10a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m0 0c-.61-.002-1.344.07-1.908-.218a2 2 0 0 1-.874-.874C2 16.98 2 16.42 2 15.3V8.7c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 5.5 4.08 5.5 5.2 5.5h6.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874c.205.402.217.92.218 1.908" fill="none"/>
    </svg>
  );
}
