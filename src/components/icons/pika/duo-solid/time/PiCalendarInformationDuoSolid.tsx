import React from 'react';

/**
 * PiCalendarInformationDuoSolid icon from the duo-solid style in time category.
 */
interface PiCalendarInformationDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCalendarInformationDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'calendar-information icon',
  ...props
}: PiCalendarInformationDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M11.916 3c-1.755 0-3.042 0-4.05.137a6 6 0 0 0-1.545.396A7 7 0 0 0 2.533 7.32c-.318.768-.439 1.605-.491 2.628C2 10.762 2 11.75 2 12.974v.063c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.947.059-3.314v-.063c0-1.223 0-2.212-.042-3.025-.052-1.023-.173-1.86-.49-2.628a7 7 0 0 0-3.79-3.788 6 6 0 0 0-1.544-.396C15.127 3 13.84 3 12.084 3z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2v4m8-4v4m-4 7.376v4m0-7.375z"/>
    </svg>
  );
}
