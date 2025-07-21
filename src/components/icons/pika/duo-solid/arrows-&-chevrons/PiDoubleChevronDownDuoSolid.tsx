import React from 'react';

/**
 * PiDoubleChevronDownDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiDoubleChevronDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDoubleChevronDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'double-chevron-down icon',
  ...props
}: PiDoubleChevronDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8.075 6.003a1 1 0 0 0-.884 1.585 21.4 21.4 0 0 0 3.884 4.085 1.47 1.47 0 0 0 1.85 0 21.4 21.4 0 0 0 3.884-4.085 1 1 0 0 0-.884-1.585l-2.205.165a23 23 0 0 1-3.44 0z" opacity=".28"/><path fill={color || "currentColor"} d="M8.075 12.003a1 1 0 0 0-.884 1.585 21.4 21.4 0 0 0 3.884 4.085 1.47 1.47 0 0 0 1.85 0 21.4 21.4 0 0 0 3.884-4.085 1 1 0 0 0-.884-1.585l-2.205.165a23 23 0 0 1-3.44 0z"/>
    </svg>
  );
}
