import React from 'react';

/**
 * PiScriptDuoSolid icon from the duo-solid style in development category.
 */
interface PiScriptDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScriptDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'script icon',
  ...props
}: PiScriptDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M4 14.535A4 4 0 0 0 6 22h7.617c.802 0 1.484 0 2.063-.022 1.006-.038 1.842-.142 2.59-.523a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C21 16.6 21 15.727 21 14.643V9.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C15.6 2 14.727 2 13.643 2h-2.286c-1.084 0-1.958 0-2.666.058-.728.06-1.369.185-1.961.487A5 5 0 0 0 4.545 4.73c-.302.592-.428 1.233-.487 1.961C4 7.4 4 8.273 4 9.357zM7.638 4.327c.263-.134.611-.226 1.216-.276C9.471 4.001 10.264 4 11.4 4h2.2c1.137 0 1.929 0 2.546.051.605.05.953.142 1.216.276a3 3 0 0 1 1.311 1.311c.134.263.226.611.276 1.216.05.617.051 1.41.051 2.546v5.2c0 1.137 0 1.929-.051 2.546-.05.605-.142.953-.276 1.216a3 3 0 0 1-1.311 1.311c-.33.168-.778.265-1.672.303A2 2 0 0 1 16 16a1 1 0 1 0 0-2H6V9.4c0-1.137 0-1.929.051-2.546.05-.605.142-.953.276-1.216a3 3 0 0 1 1.311-1.311Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M8.293 6.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414L9.586 9 8.293 7.707a1 1 0 0 1 0-1.414Z"/><path fill={color || "currentColor"} d="M14 12a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2z"/>
    </svg>
  );
}
