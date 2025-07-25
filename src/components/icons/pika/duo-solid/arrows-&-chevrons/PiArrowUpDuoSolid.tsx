import React from 'react';

/**
 * PiArrowUpDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-up icon',
  ...props
}: PiArrowUpDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v16" opacity=".28"/><path fill={color || "currentColor"} d="M12 4a1.95 1.95 0 0 0-1.22.429 31.2 31.2 0 0 0-5.584 5.807A1 1 0 0 0 6 11.83h12a1 1 0 0 0 .804-1.594 31.2 31.2 0 0 0-5.584-5.807A1.95 1.95 0 0 0 12 4Z"/>
    </svg>
  );
}
