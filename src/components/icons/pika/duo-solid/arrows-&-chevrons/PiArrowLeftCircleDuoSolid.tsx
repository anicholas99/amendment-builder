import React from 'react';

/**
 * PiArrowLeftCircleDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowLeftCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-circle icon',
  ...props
}: PiArrowLeftCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.606 22.15 12 17.606 1.85 12 1.85 1.85 6.394 1.85 12Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.949 16a20.3 20.3 0 0 1-3.807-3.604A.63.63 0 0 1 8 12m3.949-4a20.3 20.3 0 0 0-3.807 3.604A.63.63 0 0 0 8 12m0 0h8"/>
    </svg>
  );
}
