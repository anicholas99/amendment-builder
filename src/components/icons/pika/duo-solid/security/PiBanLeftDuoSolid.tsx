import React from 'react';

/**
 * PiBanLeftDuoSolid icon from the duo-solid style in security category.
 */
interface PiBanLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBanLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ban-left icon',
  ...props
}: PiBanLeftDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M12 1.85c5.606 0 10.15 4.544 10.15 10.15 0 5.605-4.544 10.15-10.15 10.15-5.605 0-10.15-4.544-10.15-10.15C1.85 6.395 6.396 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.47 18.47 5.53 5.53"/>
    </svg>
  );
}
