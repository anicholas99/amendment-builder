import React from 'react';

/**
 * PiPlaySquareDuoSolid icon from the duo-solid style in media category.
 */
interface PiPlaySquareDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaySquareDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'play-square icon',
  ...props
}: PiPlaySquareDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M11.963 2c-1.366 0-2.443 0-3.314.06-.888.06-1.634.186-2.328.473A7 7 0 0 0 2.533 6.32c-.287.694-.413 1.44-.474 2.328C2 9.519 2 10.597 2 11.963v.074c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.948.059-3.314v-.074c0-1.366 0-2.443-.06-3.314-.06-.888-.186-1.634-.473-2.328a7 7 0 0 0-3.788-3.788c-.694-.287-1.44-.413-2.328-.474C14.481 2 13.403 2 12.037 2z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="m13.572 9.226.223.143c.497.32.913.587 1.224.83.318.248.615.535.78.925a2.25 2.25 0 0 1 0 1.752c-.165.39-.462.677-.78.925-.31.242-.727.51-1.224.83l-.223.143c-.575.37-1.051.676-1.445.88-.396.206-.825.376-1.287.343a2.25 2.25 0 0 1-1.641-.896c-.278-.372-.368-.824-.408-1.268-.041-.442-.041-1.008-.041-1.692v-.282c0-.684 0-1.25.04-1.692.041-.444.13-.897.409-1.268a2.25 2.25 0 0 1 1.64-.896c.463-.033.893.136 1.288.342.394.205.87.511 1.445.881Z" clipRule="evenodd"/>
    </svg>
  );
}
