import React from 'react';

/**
 * PiArrowBigLeftDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowBigLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-left icon',
  ...props
}: PiArrowBigLeftDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M9.207 4.195a1 1 0 0 1 1.588.92 59.8 59.8 0 0 0 0 13.77 1 1 0 0 1-1.588.92 36.3 36.3 0 0 1-6.744-6.487 2.11 2.11 0 0 1 0-2.637 36.3 36.3 0 0 1 6.744-6.486Z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M19.428 7.999c.252 0 .498 0 .706.017.267.015.529.084.77.201a2 2 0 0 1 .874.874c.117.24.185.503.2.77.02.208.02.454.02.706v2.864c0 .252 0 .498-.017.706-.016.268-.084.53-.201.77a2 2 0 0 1-.874.874 2 2 0 0 1-.77.201c-.208.017-.454.017-.706.017H9.47a1 1 0 0 1-1-.95q-.15-3.05 0-6.1a1 1 0 0 1 1-.95z" clipRule="evenodd" opacity=".28"/>
    </svg>
  );
}
