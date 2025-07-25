import React from 'react';

/**
 * PiNavigationSlantDuoSolid icon from the duo-solid style in navigation category.
 */
interface PiNavigationSlantDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNavigationSlantDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'navigation-slant icon',
  ...props
}: PiNavigationSlantDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M20.108 2.044a1.556 1.556 0 0 1 1.848 1.848 52.2 52.2 0 0 1-6.866 16.87l-.306.485c-.754 1.198-2.579.89-2.897-.49l-1.348-5.84a1.94 1.94 0 0 0-1.456-1.457l-5.84-1.347c-1.38-.319-1.689-2.144-.49-2.898l.484-.305a52.2 52.2 0 0 1 16.87-6.866Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.939 20.715a.592.592 0 0 1-1.077-.183l-1.348-5.84a2.94 2.94 0 0 0-2.206-2.206l-5.84-1.348a.591.591 0 0 1-.183-1.077"/>
    </svg>
  );
}
