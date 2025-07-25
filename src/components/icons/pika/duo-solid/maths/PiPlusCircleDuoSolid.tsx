import React from 'react';

/**
 * PiPlusCircleDuoSolid icon from the duo-solid style in maths category.
 */
interface PiPlusCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlusCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'plus-circle icon',
  ...props
}: PiPlusCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15.1V12m0 0V8.9m0 3.1H8.9m3.1 0h3.1"/>
    </svg>
  );
}
