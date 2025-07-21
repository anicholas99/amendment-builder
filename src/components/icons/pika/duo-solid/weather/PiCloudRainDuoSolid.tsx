import React from 'react';

/**
 * PiCloudRainDuoSolid icon from the duo-solid style in weather category.
 */
interface PiCloudRainDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudRainDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-rain icon',
  ...props
}: PiCloudRainDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M19.465 6.715a7.502 7.502 0 0 0-14.348 1.46 5.502 5.502 0 0 0-.11 10.62c.032-.47.171-.91.394-1.295A3 3 0 0 1 5 16v-2a3 3 0 0 1 5.529-1.615A3 3 0 0 1 12 12c.535 0 1.037.14 1.471.385A3 3 0 0 1 19 14v2c0 .546-.146 1.059-.401 1.5.178.309.303.652.362 1.018a6.502 6.502 0 0 0 .504-11.803Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M8 13a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm8 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm-4 1a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm-4 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm8 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm-4 1a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" clipRule="evenodd"/>
    </svg>
  );
}
