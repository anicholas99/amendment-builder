import React from 'react';

/**
 * PiArrowUpCircleDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowUpCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowUpCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-up-circle icon',
  ...props
}: PiArrowUpCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11.949a20.3 20.3 0 0 1 3.604-3.807A.63.63 0 0 1 12 8m4 3.949a20.3 20.3 0 0 0-3.604-3.807A.63.63 0 0 0 12 8m0 0v8"/>
    </svg>
  );
}
