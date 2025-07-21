import React from 'react';

/**
 * PiMedicinePillTabletsDuoSolid icon from the duo-solid style in medical category.
 */
interface PiMedicinePillTabletsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillTabletsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pill-tablets icon',
  ...props
}: PiMedicinePillTabletsDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M12.866 5.735a6 6 0 1 0-11.73 2.532 6 6 0 0 0 11.73-2.532Z"/><path fill={color || "currentColor"} d="M19.064 11.367a6 6 0 1 0-4.125 11.269 6 6 0 0 0 4.125-11.27Z"/></g><path fill={color || "currentColor"} d="M12.1 6.923a1 1 0 0 0-.422-1.954l-9.775 2.11a1 1 0 1 0 .422 1.955z"/><path fill={color || "currentColor"} d="M12.65 14.344a1 1 0 0 0-.687 1.878l9.39 3.437a1 1 0 0 0 .688-1.878z"/>
    </svg>
  );
}
