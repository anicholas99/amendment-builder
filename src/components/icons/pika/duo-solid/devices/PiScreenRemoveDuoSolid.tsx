import React from 'react';

/**
 * PiScreenRemoveDuoSolid icon from the duo-solid style in devices category.
 */
interface PiScreenRemoveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScreenRemoveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'screen-remove icon',
  ...props
}: PiScreenRemoveDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M17.74 1.105a1 1 0 1 0-1.413 1.414l1.767 1.768-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.77 1.767 1.769a1 1 0 1 0 1.415-1.414l-1.768-1.768 1.768-1.768a1 1 0 0 0-1.415-1.414L19.51 2.873zM4.365 1h9.781a3 3 0 0 0 .767 2.933l.354.354-.354.353a3 3 0 0 0 4.243 4.243l.354-.353.353.353A3 3 0 0 0 23 9.585v5.05c0 .39 0 .74-.024 1.03a2.5 2.5 0 0 1-.248.97 2.5 2.5 0 0 1-1.093 1.092 2.5 2.5 0 0 1-.968.25c-.292.023-.642.023-1.03.023H4.363c-.39 0-.74 0-1.03-.024a2.5 2.5 0 0 1-.969-.248 2.5 2.5 0 0 1-1.093-1.094 2.5 2.5 0 0 1-.248-.968C1 15.375 1 15.025 1 14.637V4.364c0-.39 0-.74.024-1.03.025-.313.083-.644.248-.97a2.5 2.5 0 0 1 1.093-1.092c.325-.165.656-.223.968-.248C3.625 1 3.975 1 4.363 1z" clipRule="evenodd"/>
    </svg>
  );
}
