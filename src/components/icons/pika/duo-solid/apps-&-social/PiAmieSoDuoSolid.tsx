import React from 'react';

/**
 * PiAmieSoDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiAmieSoDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAmieSoDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'amie-so icon',
  ...props
}: PiAmieSoDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8.21 2a6.21 6.21 0 0 0-4.92 10A6.21 6.21 0 0 0 12 20.71 6.21 6.21 0 0 0 20.71 12 6.21 6.21 0 0 0 12 3.29 6.2 6.2 0 0 0 8.21 2Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 14v-4a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0Z"/>
    </svg>
  );
}
