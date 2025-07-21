import React from 'react';

/**
 * PiPiechartRoseDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiPiechartRoseDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechartRoseDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-rose icon',
  ...props
}: PiPiechartRoseDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.858 13a8.863 8.863 0 0 1-8.863 8.864v-1.108M19.858 13h1.274c0-5.599-4.539-10.137-10.137-10.137v3.49M19.858 13h-8.863m0 7.755A7.755 7.755 0 0 1 3.24 13h1.108m6.647 7.755V13m-6.647 0a6.647 6.647 0 0 1 6.647-6.647M4.348 13h6.647m0-6.647V13" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.132 13c0-5.598-4.539-10.136-10.137-10.136V13z" fill="none"/>
    </svg>
  );
}
