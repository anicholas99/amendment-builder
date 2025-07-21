import React from 'react';

/**
 * PiFigmaDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiFigmaDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFigmaDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'figma icon',
  ...props
}: PiFigmaDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8.167 1a3.833 3.833 0 1 0 0 7.667 3.833 3.833 0 1 0 0 7.666A3.833 3.833 0 1 0 12 20.167v-11.5h3.834a3.833 3.833 0 0 0 0-7.667z" opacity=".28"/><path fill={color || "currentColor"} d="M12 12.5a3.833 3.833 0 1 1 7.667 0 3.833 3.833 0 0 1-7.667 0Z"/>
    </svg>
  );
}
