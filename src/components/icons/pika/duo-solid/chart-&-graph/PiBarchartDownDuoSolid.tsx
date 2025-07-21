import React from 'react';

/**
 * PiBarchartDownDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiBarchartDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBarchartDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'barchart-down icon',
  ...props
}: PiBarchartDownDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M22 16.667c0-.62 0-.93-.068-1.185a2 2 0 0 0-1.415-1.414C20.263 14 19.954 14 19.333 14s-.93 0-1.184.068a2 2 0 0 0-1.414 1.414c-.068.255-.068.565-.068 1.185V20.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.213.109.493.109 1.054.109h.533c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C22 20.48 22 19.92 22 18.8z"/><path fill={color || "currentColor"} d="M14.667 10.667c0-.62 0-.93-.069-1.185a2 2 0 0 0-1.414-1.414C12.93 8 12.62 8 12 8s-.93 0-1.184.068A2 2 0 0 0 9.4 9.482c-.068.255-.068.565-.068 1.185V20.4c0 .56 0 .84.11 1.054a1 1 0 0 0 .436.437c.214.109.494.109 1.054.109h2.134c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437c.109-.214.109-.494.109-1.054z"/></g><path fill={color || "currentColor"} d="M7.333 4.667c0-.62 0-.93-.068-1.185a2 2 0 0 0-1.414-1.414C5.597 2 5.287 2 4.667 2s-.93 0-1.185.068a2 2 0 0 0-1.414 1.414C2 3.737 2 4.047 2 4.667V18.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C3.52 22 4.08 22 5.2 22h.533c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437c.11-.214.11-.494.11-1.054z"/>
    </svg>
  );
}
