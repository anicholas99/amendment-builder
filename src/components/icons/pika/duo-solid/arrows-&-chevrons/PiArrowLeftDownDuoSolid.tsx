import React from 'react';

/**
 * PiArrowLeftDownDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowLeftDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-down icon',
  ...props
}: PiArrowLeftDownDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.363 17.637 19.091 4.909" opacity=".28"/><path fill={color || "currentColor"} d="M5.656 18.344a1.95 1.95 0 0 1-.559-1.166 31.2 31.2 0 0 1 .157-8.054 1 1 0 0 1 1.696-.56l8.486 8.486a1 1 0 0 1-.56 1.696c-2.672.4-5.38.453-8.054.157a1.95 1.95 0 0 1-1.166-.559Z"/>
    </svg>
  );
}
