import React from 'react';

/**
 * PiDeleteDustbin01DuoSolid icon from the duo-solid style in general category.
 */
interface PiDeleteDustbin01DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDeleteDustbin01DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'delete-dustbin-01 icon',
  ...props
}: PiDeleteDustbin01DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M6 5a1 1 0 0 0-1 1v9.036c0 .901 0 1.629.04 2.22.042.61.13 1.148.34 1.657a5 5 0 0 0 2.707 2.706c.51.212 1.048.3 1.656.34.592.041 1.32.041 2.221.041h.072c.901 0 1.629 0 2.22-.04.61-.042 1.148-.13 1.657-.34a5 5 0 0 0 2.706-2.707c.212-.51.3-1.048.34-1.656.041-.592.041-1.32.041-2.222V6a1 1 0 0 0-1-1z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 6-1.106-2.211a3.236 3.236 0 0 0-5.788 0L8 6m8 0H4m12 0h4"/>
    </svg>
  );
}
