import React from 'react';

/**
 * PiTruckDefaultDuoStroke icon from the duo-stroke style in automotive category.
 */
interface PiTruckDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTruckDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'truck-default icon',
  ...props
}: PiTruckDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.8 5.5H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 7.02 2 7.58 2 8.7v6.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.564.287 1.298.216 1.908.218a2 2 0 1 1 4 0h6v-10c0-.988-.013-1.506-.218-1.908a2 2 0 0 0-.874-.874C13.48 5.5 12.92 5.5 11.8 5.5Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18.5v-10h2.834c.782 0 1.173 0 1.511.126a2 2 0 0 1 .781.529c.243.267.388.63.679 1.357L22 13.5v1.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.564.287-1.298.216-1.908.218m-4 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m-4 0H9m0 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" fill="none"/>
    </svg>
  );
}
