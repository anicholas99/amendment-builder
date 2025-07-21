import React from 'react';

/**
 * PiBuildingApartmentOneDuoStroke icon from the duo-stroke style in building category.
 */
interface PiBuildingApartmentOneDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBuildingApartmentOneDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'building-apartment-one icon',
  ...props
}: PiBuildingApartmentOneDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.8 2H9.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C6 3.52 6 4.08 6 5.2v15.2c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C6.76 22 7.04 22 7.6 22h7.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C17 21.24 17 20.96 17 20.4V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C15.48 2 14.92 2 13.8 2Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6h3m-3 4h3m-3 4h3m-3 4h3" fill="none"/>
    </svg>
  );
}
