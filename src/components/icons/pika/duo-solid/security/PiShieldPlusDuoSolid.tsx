import React from 'react';

/**
 * PiShieldPlusDuoSolid icon from the duo-solid style in security category.
 */
interface PiShieldPlusDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShieldPlusDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'shield-plus icon',
  ...props
}: PiShieldPlusDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.26 1.427a4 4 0 0 0-2.717 0L5.155 3.373a4 4 0 0 0-2.638 3.608l-.127 3.31a12 12 0 0 0 6.047 10.885l1.52.867a4 4 0 0 0 3.887.042l1.489-.806a12 12 0 0 0 6.25-11.472l-.228-2.95a4 4 0 0 0-2.63-3.456z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.133 15v-3m0 0V9m0 3h-3m3 0h3"/>
    </svg>
  );
}
