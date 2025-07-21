import React from 'react';

/**
 * PiInformationSquareSolid icon from the solid style in alerts category.
 */
interface PiInformationSquareSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInformationSquareSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'information-square icon',
  ...props
}: PiInformationSquareSolidProps): JSX.Element {
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
      <path fillRule="evenodd" d="M11.963 22h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.948.059-3.314v-.074c0-1.366 0-2.443-.06-3.314-.06-.888-.186-1.634-.473-2.328a7 7 0 0 0-3.788-3.788c-.694-.287-1.44-.413-2.328-.474C14.481 2 13.403 2 12.037 2h-.074c-1.366 0-2.443 0-3.314.06-.888.06-1.634.186-2.328.473A7 7 0 0 0 2.533 6.32c-.287.694-.413 1.44-.474 2.328C2 9.519 2 10.597 2 11.963v.074c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059ZM9.781 9.719a1.719 1.719 0 1 1 2.653 1.443c-.4.26-.863.606-1.233 1.049-.374.447-.701 1.048-.701 1.789a1 1 0 1 0 2 0c0-.123.05-.286.234-.505.188-.225.465-.446.789-.656a3.719 3.719 0 1 0-5.741-3.12 1 1 0 0 0 2 0ZM11.5 16a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
