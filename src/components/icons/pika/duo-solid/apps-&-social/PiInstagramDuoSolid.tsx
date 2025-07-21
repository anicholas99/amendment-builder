import React from 'react';

/**
 * PiInstagramDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiInstagramDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInstagramDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'instagram icon',
  ...props
}: PiInstagramDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M11.772 2h.456c2.295 0 3.71 0 4.883.41a7.3 7.3 0 0 1 4.48 4.479c.41 1.173.41 2.588.41 4.883v.456c0 2.295 0 3.71-.41 4.883a7.3 7.3 0 0 1-4.48 4.48c-1.173.41-2.588.41-4.883.41h-.456c-2.295 0-3.71 0-4.883-.41a7.3 7.3 0 0 1-4.48-4.48C2 15.938 2 14.523 2 12.228v-.456c0-2.295 0-3.71.41-4.883a7.3 7.3 0 0 1 4.479-4.48C8.062 2 9.477 2 11.772 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M17.046 6a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M7.68 12a4.32 4.32 0 1 1 8.64 0 4.32 4.32 0 0 1-8.64 0Z"/>
    </svg>
  );
}
