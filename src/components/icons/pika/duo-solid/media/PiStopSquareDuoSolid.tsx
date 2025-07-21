import React from 'react';

/**
 * PiStopSquareDuoSolid icon from the duo-solid style in media category.
 */
interface PiStopSquareDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStopSquareDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'stop-square icon',
  ...props
}: PiStopSquareDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M11.963 2c-1.366 0-2.443 0-3.314.06-.888.06-1.634.186-2.328.473A7 7 0 0 0 2.533 6.32c-.287.694-.413 1.44-.474 2.328C2 9.519 2 10.597 2 11.963v.074c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.948.059-3.314v-.074c0-1.366 0-2.443-.06-3.314-.06-.888-.186-1.634-.473-2.328a7 7 0 0 0-3.788-3.788c-.694-.287-1.44-.413-2.328-.474C14.481 2 13.403 2 12.037 2z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M10.574 8.25h2.852c.258 0 .494 0 .692.016.213.018.446.057.676.175.33.168.598.435.765.765.118.23.158.463.175.676.016.198.016.434.016.692v2.852c0 .258 0 .494-.016.692a1.8 1.8 0 0 1-.175.676 1.75 1.75 0 0 1-.764.765c-.23.118-.464.158-.677.175-.198.016-.434.016-.692.016h-2.852c-.258 0-.494 0-.692-.016a1.8 1.8 0 0 1-.676-.175 1.75 1.75 0 0 1-.765-.764 1.8 1.8 0 0 1-.175-.677 9 9 0 0 1-.016-.692v-2.852c0-.258 0-.494.016-.692a1.8 1.8 0 0 1 .175-.676 1.75 1.75 0 0 1 .765-.765 1.8 1.8 0 0 1 .676-.175c.198-.016.434-.016.692-.016Z" clipRule="evenodd"/>
    </svg>
  );
}
