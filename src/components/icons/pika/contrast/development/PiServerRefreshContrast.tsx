import React from 'react';

/**
 * PiServerRefreshContrast icon from the contrast style in development category.
 */
interface PiServerRefreshContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerRefreshContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'server-refresh icon',
  ...props
}: PiServerRefreshContrastProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill="currentColor" d="M7 12c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086C3 15.303 3 15.536 3 16s0 .697.022.892a3.5 3.5 0 0 0 3.086 3.086C6.303 20 6.536 20 7 20h2.377q.214-.931.564-1.82a3.47 3.47 0 0 1 1.805-1.897 3 3 0 0 1 .992-3.094 7 7 0 0 1 2.342-1.269 6.97 6.97 0 0 1 3.665-.149 3.5 3.5 0 0 0 2.233-2.879C21 8.697 21 8.464 21 8s0-.697-.022-.892a3.5 3.5 0 0 0-3.086-3.086C17.697 4 17.464 4 17 4H7c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086C3 7.303 3 7.536 3 8s0 .697.022.892a3.5 3.5 0 0 0 3.086 3.086C6.303 12 6.536 12 7 12Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12h5.655M7 12c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086C3 15.303 3 15.536 3 16s0 .697.022.892a3.5 3.5 0 0 0 3.086 3.086C6.303 20 6.536 20 7 20h1.379M7 12c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 8.697 3 8.464 3 8s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086C6.303 4 6.536 4 7 4h10c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086C21 7.303 21 7.536 21 8s0 .697-.022.892a3.5 3.5 0 0 1-1.354 2.39m2.67 4.288a10 10 0 0 1-.671 2.363.47.47 0 0 1-.455.287m-2.403-.768c.745.348 1.53.603 2.336.76l.067.008m-5.565 1.462a10 10 0 0 0-2.4-.703m-1.079 2.677c.105-.816.31-1.615.61-2.38a.47.47 0 0 1 .469-.297m7.965-.76a4 4 0 0 0-6.524-2.714m-1.441 3.474q.04.41.167.82a4 4 0 0 0 6.366 1.88M13 8h.01M17 8h.01" fill="none"/>
    </svg>
  );
}
