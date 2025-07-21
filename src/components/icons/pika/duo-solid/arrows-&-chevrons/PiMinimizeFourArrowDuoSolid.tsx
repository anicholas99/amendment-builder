import React from 'react';

/**
 * PiMinimizeFourArrowDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiMinimizeFourArrowDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMinimizeFourArrowDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'minimize-four-arrow icon',
  ...props
}: PiMinimizeFourArrowDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M3.835 10.063c1.665.279 3.349.342 5.01.189a1.555 1.555 0 0 0 1.407-1.407c.153-1.661.09-3.345-.189-5.01a1 1 0 0 0-1.75-.481l-1.04 1.229a23 23 0 0 1-2.69 2.69l-1.23 1.04a1 1 0 0 0 .482 1.75Z"/><path fill={color || "currentColor"} d="M20.165 13.937a19.5 19.5 0 0 0-5.01-.189 1.555 1.555 0 0 0-1.407 1.407 19.5 19.5 0 0 0 .189 5.01 1 1 0 0 0 1.75.481l1.04-1.23a23 23 0 0 1 2.69-2.689l1.23-1.04a1 1 0 0 0-.482-1.75Z"/></g><path fill={color || "currentColor"} d="M20.168 10.063a19.5 19.5 0 0 1-5.01.189 1.555 1.555 0 0 1-1.406-1.407 19.5 19.5 0 0 1 .188-5.01 1 1 0 0 1 1.75-.481l1.04 1.229c.821.97 1.72 1.87 2.69 2.69l1.23 1.04a1 1 0 0 1-.482 1.75Z"/><path fill={color || "currentColor"} d="M3.831 13.937a19.5 19.5 0 0 1 5.01-.189 1.555 1.555 0 0 1 1.407 1.407c.154 1.661.09 3.345-.188 5.01a1 1 0 0 1-1.75.481l-1.04-1.23a23 23 0 0 0-2.69-2.689l-1.23-1.04a1 1 0 0 1 .481-1.75Z"/>
    </svg>
  );
}
