import React from 'react';

/**
 * PiMaximizeFourArrowDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiMaximizeFourArrowDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMaximizeFourArrowDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'maximize-four-arrow icon',
  ...props
}: PiMaximizeFourArrowDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M4.488 3.082a19.5 19.5 0 0 1 5.01.188 1 1 0 0 1 .482 1.75L8.75 6.06a23 23 0 0 0-2.69 2.69L5.02 9.98a1 1 0 0 1-1.75-.482 19.5 19.5 0 0 1-.188-5.01 1.555 1.555 0 0 1 1.406-1.406Z"/><path fill={color || "currentColor"} d="M19.512 20.918c-1.662.154-3.346.09-5.01-.188a1 1 0 0 1-.482-1.75l1.23-1.04a23 23 0 0 0 2.69-2.69l1.04-1.23a1 1 0 0 1 1.75.482c.279 1.664.342 3.348.188 5.01a1.555 1.555 0 0 1-1.406 1.406Z"/></g><path fill={color || "currentColor"} d="M19.515 3.082a19.5 19.5 0 0 0-5.01.188 1 1 0 0 0-.481 1.75l1.229 1.04a23 23 0 0 1 2.69 2.69l1.04 1.23a1 1 0 0 0 1.75-.482 19.5 19.5 0 0 0 .189-5.01 1.555 1.555 0 0 0-1.407-1.406Z"/><path fill={color || "currentColor"} d="M4.485 20.918c1.661.154 3.345.09 5.01-.188a1 1 0 0 0 .481-1.75l-1.23-1.04a23 23 0 0 1-2.689-2.69l-1.04-1.23a1 1 0 0 0-1.75.482 19.5 19.5 0 0 0-.189 5.01 1.555 1.555 0 0 0 1.407 1.406Z"/>
    </svg>
  );
}
