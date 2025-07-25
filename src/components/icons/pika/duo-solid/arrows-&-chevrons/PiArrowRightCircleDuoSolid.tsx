import React from 'react';

/**
 * PiArrowRightCircleDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowRightCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowRightCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-right-circle icon',
  ...props
}: PiArrowRightCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M22.15 12c0-5.606-4.544-10.15-10.15-10.15S1.85 6.394 1.85 12 6.394 22.15 12 22.15c5.605 0 10.15-4.544 10.15-10.15Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.051 8a20.3 20.3 0 0 1 3.807 3.604A.63.63 0 0 1 16 12m-3.949 4a20.3 20.3 0 0 0 3.807-3.604A.63.63 0 0 0 16 12m0 0H8"/>
    </svg>
  );
}
