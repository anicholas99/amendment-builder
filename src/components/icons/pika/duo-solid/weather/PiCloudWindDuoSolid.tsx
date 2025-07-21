import React from 'react';

/**
 * PiCloudWindDuoSolid icon from the duo-solid style in weather category.
 */
interface PiCloudWindDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudWindDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-wind icon',
  ...props
}: PiCloudWindDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M19.465 6.715a7.502 7.502 0 0 0-14.349 1.46 5.5 5.5 0 0 0-3.531 2.853Q1.789 11.001 2 11h7.09a3 3 0 0 1 1.408-3.33 5 5 0 1 1 3.436 9.242c.47.601.808 1.312.966 2.088h1.6a6.5 6.5 0 0 0 2.965-12.285Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M13 11a1 1 0 0 0-.5.133 1 1 0 1 1-1-1.731A3 3 0 1 1 13 15H2a1 1 0 1 1 0-2h11a1 1 0 1 0 0-2ZM1 18a1 1 0 0 1 1-1h8a3 3 0 1 1-1.5 5.598 1 1 0 1 1 1-1.731A1 1 0 1 0 10 19H2a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
    </svg>
  );
}
