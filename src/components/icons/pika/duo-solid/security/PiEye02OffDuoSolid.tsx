import React from 'react';

/**
 * PiEye02OffDuoSolid icon from the duo-solid style in security category.
 */
interface PiEye02OffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEye02OffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'eye-02-off icon',
  ...props
}: PiEye02OffDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M4 14c0-.77.524-2.28 1.848-3.617C7.131 9.088 9.128 8 12 8c1.489 0 2.736.292 3.765.746a1 1 0 1 0 .807-1.83C15.28 6.346 13.758 6 12 6 8.572 6 6.07 7.318 4.427 8.976 2.826 10.593 2 12.583 2 14a1 1 0 1 0 2 0Z"/><path fill={color || "currentColor"} d="M20.163 9.63a1 1 0 1 0-1.544 1.27C19.611 12.106 20 13.338 20 14a1 1 0 1 0 2 0c0-1.242-.634-2.909-1.837-4.37Z"/><path fill={color || "currentColor"} d="M12 10a4 4 0 0 0-3.828 5.162 1 1 0 0 0 1.664.417l3.743-3.743a1 1 0 0 0-.418-1.665A4 4 0 0 0 12 10Z"/><path fill={color || "currentColor"} d="M15.874 15a1 1 0 0 0-1.676-.956l-2.154 2.154A1 1 0 0 0 13 17.874 4 4 0 0 0 15.874 15Z"/></g><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22"/>
    </svg>
  );
}
