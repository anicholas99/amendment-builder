import React from 'react';

/**
 * PiChocolateBarDuoSolid icon from the duo-solid style in food category.
 */
interface PiChocolateBarDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChocolateBarDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'chocolate-bar icon',
  ...props
}: PiChocolateBarDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7.5 1A3.5 3.5 0 0 0 4 4.5v15A3.5 3.5 0 0 0 7.5 23h9a3.5 3.5 0 0 0 3.5-3.5V8a1 1 0 0 0-1-1 2 2 0 0 1-1.98-1.717 1 1 0 0 0-1.063-.86 4 4 0 0 1-3.797-2.738A1 1 0 0 0 11.211 1z" opacity=".28"/><path fill={color || "currentColor"} d="M4 8h7V1h.211a1 1 0 0 1 .95.685c.178.537.466 1.023.839 1.431V8h7v2h-7v4h7v2h-7v7h-2v-7H4v-2h7v-4H4z"/>
    </svg>
  );
}
