import React from 'react';

/**
 * PiBuildingHotelContrast icon from the contrast style in building category.
 */
interface PiBuildingHotelContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBuildingHotelContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'building-hotel icon',
  ...props
}: PiBuildingHotelContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M19 19.5V4.19a14.67 14.67 0 0 0-14 0V19.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="16" strokeWidth="2" d="M19 4.19V19.5a1.5 1.5 0 0 1-1.5 1.5H14m5-16.81a14.67 14.67 0 0 0-14 0m14 0c.692.377 1.362.814 2 1.31M5 4.19V19.5A1.5 1.5 0 0 0 6.5 21H10M5 4.19q-1.041.566-2 1.31M10 21h4m-4 0v-4.435M14 21v-4.435m.829.636a4 4 0 0 0-.83-.636m-4.827.636a4 4 0 0 1 .828-.636m4 0a4 4 0 0 0-4 0M8 7v.01M8 10v.01M8 13v.01M12 7v.01M12 10v.01M12 13v.01M16 7v.01M16 10v.01M16 13v.01" fill="none"/>
    </svg>
  );
}
