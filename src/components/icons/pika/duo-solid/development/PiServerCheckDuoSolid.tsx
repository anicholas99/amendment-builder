import React from 'react';

/**
 * PiServerCheckDuoSolid icon from the duo-solid style in development category.
 */
interface PiServerCheckDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerCheckDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'server-check icon',
  ...props
}: PiServerCheckDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} fillRule="evenodd" d="M2 6.4A3.4 3.4 0 0 1 5.4 3h13.2A3.4 3.4 0 0 1 22 6.4v1.2a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 7.6z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M2 16.4A3.4 3.4 0 0 1 5.4 13h13.2c.818 0 1.568.289 2.155.77q-.23.105-.447.253a16.7 16.7 0 0 0-2.82 2.428 3 3 0 0 0-3.898 4.54l.01.009H5.4A3.4 3.4 0 0 1 2 17.6z"/></g><path fill={color || "currentColor"} d="M14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path fill={color || "currentColor"} d="M18 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path fill={color || "currentColor"} d="M22.826 15.936a1 1 0 0 1-.262 1.39 12.66 12.66 0 0 0-3.851 4.17 1 1 0 0 1-1.575.212l-2.135-2.133a1 1 0 0 1 1.414-1.415l1.25 1.25a14.7 14.7 0 0 1 3.769-3.736 1 1 0 0 1 1.39.262Z"/>
    </svg>
  );
}
