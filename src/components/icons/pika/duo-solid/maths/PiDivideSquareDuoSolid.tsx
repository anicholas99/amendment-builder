import React from 'react';

/**
 * PiDivideSquareDuoSolid icon from the duo-solid style in maths category.
 */
interface PiDivideSquareDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDivideSquareDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'divide-square icon',
  ...props
}: PiDivideSquareDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M11.963 2c-1.366 0-2.443 0-3.314.06-.888.06-1.634.186-2.328.473A7 7 0 0 0 2.533 6.32c-.287.694-.413 1.44-.474 2.328C2 9.519 2 10.597 2 11.963v.074c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.948.059-3.314v-.074c0-1.366 0-2.443-.06-3.314-.06-.888-.186-1.634-.473-2.328a7 7 0 0 0-3.788-3.788c-.694-.287-1.44-.413-2.328-.474C14.481 2 13.403 2 12.037 2z" opacity=".28"/><path fill={color || "currentColor"} d="M12 6.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z"/><path fill={color || "currentColor"} d="M12 14.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z"/><path fill={color || "currentColor"} d="M7.9 11a1 1 0 1 0 0 2h8.2a1 1 0 0 0 0-2z"/>
    </svg>
  );
}
