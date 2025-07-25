import React from 'react';

/**
 * PiTrackpadDuoSolid icon from the duo-solid style in devices category.
 */
interface PiTrackpadDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrackpadDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'trackpad icon',
  ...props
}: PiTrackpadDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M15.6 2c1.103 0 1.991-.001 2.709.058.728.06 1.368.185 1.96.487a5 5 0 0 1 2.186 2.185l.106.224c.227.53.33 1.1.381 1.737.059.718.058 1.606.058 2.71V14.6c0 1.103.001 1.991-.058 2.709-.052.637-.154 1.208-.381 1.737l-.106.224a5 5 0 0 1-2.185 2.185c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H8.4c-1.103 0-1.991.001-2.709-.058-.637-.052-1.208-.154-1.737-.381l-.224-.106a5 5 0 0 1-2.185-2.185c-.302-.593-.428-1.233-.487-1.961C.999 16.59 1 15.703 1 14.599V9.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96A5 5 0 0 1 3.73 2.544c.593-.302 1.233-.428 1.961-.487C6.41 1.999 7.297 2 8.401 2z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M2 13h10m0 0h10m-10 0v8"/>
    </svg>
  );
}
