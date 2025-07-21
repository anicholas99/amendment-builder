import React from 'react';

/**
 * PiPaintBrushDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPaintBrushDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPaintBrushDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'paint-brush icon',
  ...props
}: PiPaintBrushDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.484 11a7.83 7.83 0 0 1 3.639-4.094l7.27-3.848c.414-.22.862.229.643.643l-3.849 7.27A7.83 7.83 0 0 1 13 14.645" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.85 15.165c-1.216-1.217-3.049-1.138-4.074.107-.652.79-.413 1.668-.784 2.522A2.05 2.05 0 0 1 2 19.01c1.42 2.468 5.013 2.67 6.721.446.933-1.215 1.402-3.017.13-4.29Z" fill="none"/>
    </svg>
  );
}
