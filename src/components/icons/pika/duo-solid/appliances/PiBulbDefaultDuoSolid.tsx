import React from 'react';

/**
 * PiBulbDefaultDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiBulbDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBulbDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'bulb-default icon',
  ...props
}: PiBulbDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2C7.618 2 4 5.428 4 9.737c0 2.357 1.09 4.46 2.79 5.872.548.454.914.936 1.046 1.442l.28 1.078A2.5 2.5 0 0 0 10.535 20h2.929a2.5 2.5 0 0 0 2.42-1.871l.28-1.078c.13-.506.497-.988 1.044-1.442C18.91 14.197 20 12.094 20 9.737 20 5.428 16.382 2 12 2Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12v4m0-4h1m-1 0h-1m-1 10h4"/>
    </svg>
  );
}
