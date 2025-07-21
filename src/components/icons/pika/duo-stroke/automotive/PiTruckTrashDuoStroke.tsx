import React from 'react';

/**
 * PiTruckTrashDuoStroke icon from the duo-stroke style in automotive category.
 */
interface PiTruckTrashDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTruckTrashDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'truck-trash icon',
  ...props
}: PiTruckTrashDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 18.5c-.61-.002-1.344.07-1.908-.218a2 2 0 0 1-.874-.874C2 16.98 2 16.42 2 15.3V10l13-4v2.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18.5a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m-4 0H9m6 0q.002-5 0-10h2.834c.782 0 1.173 0 1.511.126a2 2 0 0 1 .781.529c.243.267.388.63.679 1.357L22 13.5v1.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.564.287-1.298.216-1.908.218m-10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" fill="none"/>
    </svg>
  );
}
