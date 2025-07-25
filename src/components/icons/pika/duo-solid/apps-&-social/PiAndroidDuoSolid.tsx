import React from 'react';

/**
 * PiAndroidDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiAndroidDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAndroidDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'android icon',
  ...props
}: PiAndroidDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M4.866 4.5a1 1 0 0 0-1.732 1l1.399 2.423A10.97 10.97 0 0 0 1 16v1.982C1 18.544 1.456 19 2.018 19h19.964c.562 0 1.018-.456 1.018-1.018V16c0-3.193-1.362-6.069-3.533-8.077L20.866 5.5a1 1 0 1 0-1.732-1l-1.267 2.194A10.95 10.95 0 0 0 12 5c-2.156 0-4.169.621-5.867 1.694z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
    </svg>
  );
}
