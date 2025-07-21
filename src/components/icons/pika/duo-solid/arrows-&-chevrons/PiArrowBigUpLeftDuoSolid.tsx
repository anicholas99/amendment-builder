import React from 'react';

/**
 * PiArrowBigUpLeftDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowBigUpLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigUpLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-up-left icon',
  ...props
}: PiArrowBigUpLeftDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="m19.47 13.815.024.023q.253.247.487.511c.178.2.315.434.403.687a2 2 0 0 1 0 1.236c-.095.29-.254.511-.403.686-.135.16-.31.333-.487.512l-.023.022-1.98 1.98-.022.023a9 9 0 0 1-.511.487 2 2 0 0 1-.687.402c-.402.13-.834.13-1.236 0a2 2 0 0 1-.686-.402c-.16-.135-.333-.309-.512-.487l-.022-.023-7.02-7.02a1 1 0 0 1-.034-1.378 62 62 0 0 1 4.312-4.312 1 1 0 0 1 1.379.034l7.02 7.02z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M14.956 3.92a1 1 0 0 1 .473 1.772 59.8 59.8 0 0 0-9.737 9.736 1 1 0 0 1-1.773-.472 36.3 36.3 0 0 1-.182-9.355 2.106 2.106 0 0 1 1.864-1.864 36.3 36.3 0 0 1 9.355.182Z" clipRule="evenodd"/>
    </svg>
  );
}
