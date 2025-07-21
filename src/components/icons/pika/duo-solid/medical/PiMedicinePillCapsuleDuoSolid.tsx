import React from 'react';

/**
 * PiMedicinePillCapsuleDuoSolid icon from the duo-solid style in medical category.
 */
interface PiMedicinePillCapsuleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillCapsuleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pill-capsule icon',
  ...props
}: PiMedicinePillCapsuleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M20.485 3.515a6.25 6.25 0 0 0-8.841 0l-8.13 8.129a6.252 6.252 0 1 0 8.842 8.841l8.13-8.129a6.25 6.25 0 0 0 0-8.841Z" opacity=".28"/><path fill={color || "currentColor"} d="M17.326 5.494a2.5 2.5 0 0 0-2.845.488L12.713 7.75a1 1 0 0 0 1.414 1.414l1.768-1.767a.5.5 0 0 1 .57-.098 1 1 0 1 0 .861-1.805Z"/><path fill={color || "currentColor"} d="M8.993 7.58A1 1 0 1 0 7.58 8.993l7.427 7.427a1 1 0 0 0 1.414-1.414z"/>
    </svg>
  );
}
