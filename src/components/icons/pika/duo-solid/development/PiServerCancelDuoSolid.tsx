import React from 'react';

/**
 * PiServerCancelDuoSolid icon from the duo-solid style in development category.
 */
interface PiServerCancelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerCancelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'server-cancel icon',
  ...props
}: PiServerCancelDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} fillRule="evenodd" d="M2 6.4A3.4 3.4 0 0 1 5.4 3h13.2A3.4 3.4 0 0 1 22 6.4v1.2a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 7.6z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M2 16.4A3.4 3.4 0 0 1 5.4 13h10.599a3 3 0 0 0-2.12 5.121l.378.379-.378.379A3 3 0 0 0 13 21H5.4A3.4 3.4 0 0 1 2 17.6z"/><path fill={color || "currentColor"} d="M18.121 13.879a3 3 0 0 0-2.12-.879H18.6c.437 0 .855.082 1.24.233a3 3 0 0 0-.961.646l-.379.378z"/></g><path fill={color || "currentColor"} d="M14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path fill={color || "currentColor"} d="M18 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path fill={color || "currentColor"} d="M15.293 15.293a1 1 0 0 1 1.414 0l1.793 1.793 1.793-1.793a1 1 0 0 1 1.414 1.414L19.914 18.5l1.793 1.793a1 1 0 0 1-1.414 1.414L18.5 19.914l-1.793 1.793a1 1 0 0 1-1.414-1.414l1.793-1.793-1.793-1.793a1 1 0 0 1 0-1.414Z"/>
    </svg>
  );
}
