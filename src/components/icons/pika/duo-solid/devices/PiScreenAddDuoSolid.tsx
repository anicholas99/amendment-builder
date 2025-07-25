import React from 'react';

/**
 * PiScreenAddDuoSolid icon from the duo-solid style in devices category.
 */
interface PiScreenAddDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScreenAddDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'screen-add icon',
  ...props
}: PiScreenAddDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M4.364 1H16.17c-.11.313-.171.65-.171 1a3 3 0 1 0 0 6 3 3 0 1 0 6 0c.35 0 .687-.06 1-.17v6.806c0 .39 0 .74-.024 1.03a2.5 2.5 0 0 1-.248.969 2.5 2.5 0 0 1-1.093 1.092 2.5 2.5 0 0 1-.968.25c-.292.023-.642.023-1.03.023H4.363c-.39 0-.74 0-1.03-.024a2.5 2.5 0 0 1-.969-.248 2.5 2.5 0 0 1-1.093-1.093 2.5 2.5 0 0 1-.248-.968q-.03-.515-.023-1.03V4.363c0-.39 0-.74.024-1.03.025-.313.083-.644.248-.969a2.5 2.5 0 0 1 1.093-1.093c.325-.165.656-.223.968-.248C3.625 1 3.976 1 4.364 1Zm17.588.465c.225.16.422.358.583.583A3 3 0 0 0 22 2q0-.27-.048-.535ZM20 2a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0V6h2a1 1 0 0 0 0-2h-2z" clipRule="evenodd"/>
    </svg>
  );
}
