import React from 'react';

/**
 * PiSpatialCurvedScreenDuoSolid icon from the duo-solid style in ar-&-vr category.
 */
interface PiSpatialCurvedScreenDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpatialCurvedScreenDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spatial-curved-screen icon',
  ...props
}: PiSpatialCurvedScreenDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 20.997h-5m-2.99 0H8"/><path fill={color || "currentColor"} d="M20.496 2.405A2 2 0 0 1 23 4.383V16.61l-.001.116a2 2 0 0 1-2.503 1.862l-.111-.032-.01-.003-.638-.19a28 28 0 0 0-16.112.19l-.01.003-.111.032a2 2 0 0 1-2.503-1.862L1 16.61V4.383l.001-.116a2 2 0 0 1 2.503-1.862l.111.032.01.003.638.19a28 28 0 0 0 16.112-.19l.01-.003c.034-.01.074-.023.111-.032Z" opacity=".35"/>
    </svg>
  );
}
