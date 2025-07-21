import React from 'react';

/**
 * PiBulbDefaultDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiBulbDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBulbDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bulb-default icon',
  ...props
}: PiBulbDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3C8.134 3 5 6.016 5 9.737c0 2.04.942 3.867 2.43 5.103.628.521 1.168 1.17 1.373 1.96l.28 1.077A1.5 1.5 0 0 0 10.535 19h2.93a1.5 1.5 0 0 0 1.452-1.123l.28-1.077c.205-.79.745-1.439 1.374-1.96C18.058 13.604 19 11.776 19 9.737 19 6.017 15.866 3 12 3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12v4m0-4h1m-1 0h-1m-1 10h4" fill="none"/>
    </svg>
  );
}
