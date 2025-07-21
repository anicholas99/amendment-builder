import React from 'react';

/**
 * PiDownloadBarDownDuoSolid icon from the duo-solid style in general category.
 */
interface PiDownloadBarDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDownloadBarDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'download-bar-down icon',
  ...props
}: PiDownloadBarDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M5 19a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2z" opacity=".28"/><path fill={color || "currentColor"} d="M13 9.571a43 43 0 0 0 4.863-.392 1 1 0 0 1 .941 1.585 31.2 31.2 0 0 1-5.584 5.807 1.95 1.95 0 0 1-2.44 0 31.2 31.2 0 0 1-5.584-5.807 1 1 0 0 1 .941-1.585c1.614.223 3.238.354 4.863.392V4a1 1 0 1 1 2 0z"/>
    </svg>
  );
}
