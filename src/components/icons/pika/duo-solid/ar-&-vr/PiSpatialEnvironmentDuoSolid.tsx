import React from 'react';

/**
 * PiSpatialEnvironmentDuoSolid icon from the duo-solid style in ar-&-vr category.
 */
interface PiSpatialEnvironmentDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpatialEnvironmentDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spatial-environment icon',
  ...props
}: PiSpatialEnvironmentDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M20.496 2.409A2 2 0 0 1 23 4.386v12.228l-.001.115a2 2 0 0 1-2.614 1.83l-.01-.003-.638-.19a28 28 0 0 0-16.112.19l-.01.003c-.034.01-.075.023-.111.032a2 2 0 0 1-2.503-1.862L1 16.614V4.386l.001-.115a2 2 0 0 1 2.503-1.862c.036.009.077.021.111.031l.01.004c.328.098.485.145.638.189a28 28 0 0 0 16.112-.19l.01-.003c.034-.01.074-.022.111-.031Z" opacity=".28"/><path fill={color || "currentColor"} d="M8.75 12.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Z"/><path fill={color || "currentColor"} d="M8 21a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2 1 1 0 1 0 2 0 4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4 1 1 0 1 0 2 0Z"/>
    </svg>
  );
}
