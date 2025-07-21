import React from 'react';

/**
 * PiShare02DuoSolid icon from the duo-solid style in general category.
 */
interface PiShare02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShare02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'share-02 icon',
  ...props
}: PiShare02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M3 12a1 1 0 0 1 1 1v1.6c0 1.136 0 1.929.051 2.546.05.605.142.952.276 1.216a3 3 0 0 0 1.31 1.31c.264.135.612.227 1.217.277.617.05 1.41.051 2.546.051h5.2c1.136 0 1.929 0 2.546-.051.605-.05.953-.142 1.216-.276a3 3 0 0 0 1.31-1.31c.135-.264.227-.612.277-1.217.05-.617.051-1.41.051-2.546V13a1 1 0 1 1 2 0v1.643c0 1.083 0 1.958-.058 2.665-.06.73-.185 1.37-.487 1.962a5 5 0 0 1-2.185 2.185c-.592.302-1.233.428-1.962.487-.707.058-1.581.058-2.665.058H9.357c-1.083 0-1.958 0-2.665-.058-.73-.06-1.37-.185-1.962-.487a5 5 0 0 1-2.185-2.185c-.302-.592-.428-1.233-.487-1.962C2 16.601 2 15.726 2 14.643V13a1 1 0 0 1 1-1Z" opacity=".28"/><path fill={color || "currentColor"} d="M11.998 2h.004c.45 0 .886.16 1.231.45a21.3 21.3 0 0 1 3.575 3.817 1 1 0 0 1-.906 1.584 77 77 0 0 1-1.112-.12A38 38 0 0 0 13 7.555V16a1 1 0 1 1-2 0V7.555c-.586.039-1.176.106-1.79.175q-.54.063-1.111.121a1 1 0 0 1-.907-1.584 21.3 21.3 0 0 1 3.576-3.819A1.92 1.92 0 0 1 11.998 2Z"/>
    </svg>
  );
}
