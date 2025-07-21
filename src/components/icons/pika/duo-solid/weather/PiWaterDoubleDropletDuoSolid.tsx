import React from 'react';

/**
 * PiWaterDoubleDropletDuoSolid icon from the duo-solid style in weather category.
 */
interface PiWaterDoubleDropletDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWaterDoubleDropletDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'water-double-droplet icon',
  ...props
}: PiWaterDoubleDropletDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M11.354 2.237a1 1 0 0 1 1.292 0c2.772 2.345 4.7 4.566 5.923 6.63a3 3 0 0 0-3.09.585c-3.444 3.137-5.134 6.56-4.255 9.808a6.2 6.2 0 0 0 1.525 2.705 8 8 0 0 1-.75.035c-3.177 0-6.91-1.936-7.976-5.595-1.082-3.71.738-8.59 7.33-14.168Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M18.173 10.93a1 1 0 0 0-1.346 0c-3.236 2.948-4.258 5.644-3.672 7.807.576 2.129 2.597 3.266 4.345 3.266s3.77-1.137 4.345-3.266c.586-2.163-.436-4.861-3.672-7.807Z"/>
    </svg>
  );
}
