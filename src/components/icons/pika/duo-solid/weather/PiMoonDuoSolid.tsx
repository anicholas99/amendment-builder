import React from 'react';

/**
 * PiMoonDuoSolid icon from the duo-solid style in weather category.
 */
interface PiMoonDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMoonDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'moon icon',
  ...props
}: PiMoonDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10v-.038a1 1 0 0 0-1.846-.53 5.5 5.5 0 1 1-7.586-7.586A1 1 0 0 0 12.038 2z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M13.477 2.464a1 1 0 0 1-.27 1.388 5 5 0 1 0 6.94 6.94 1 1 0 0 1 1.659 1.12 7 7 0 1 1-9.717-9.718 1 1 0 0 1 1.388.27Z" clipRule="evenodd"/>
    </svg>
  );
}
