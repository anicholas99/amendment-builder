import React from 'react';

/**
 * PiHourglassDuoSolid icon from the duo-solid style in time category.
 */
interface PiHourglassDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHourglassDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'hourglass icon',
  ...props
}: PiHourglassDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.254 1c-1.296 0-2.34 0-3.132.074-.764.072-1.556.227-2.115.759a3.32 3.32 0 0 0-.987 2.761c.134 1.21.747 2.117 1.485 2.823.69.659 1.544 1.194 2.287 1.66l.084.053c.807.506 1.474.935 1.954 1.422.45.457.67.901.67 1.448a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1c0-.547.22-.991.67-1.448.48-.487 1.147-.916 1.954-1.422l.084-.053c.743-.466 1.598-1.001 2.287-1.66.737-.706 1.351-1.613 1.485-2.823a3.32 3.32 0 0 0-.987-2.761c-.559-.532-1.351-.687-2.115-.759C17.087 1 16.042 1 14.746 1z" opacity=".28"/><path fill={color || "currentColor"} d="M10.5 11a1 1 0 0 0-1 1c0 .547-.22.991-.67 1.448-.48.487-1.147.916-1.954 1.422l-.084.053c-.743.466-1.598 1.001-2.287 1.66-.738.706-1.351 1.613-1.485 2.823a3.32 3.32 0 0 0 .987 2.761c.559.532 1.351.688 2.115.759C6.913 23 7.958 23 9.254 23h5.492c1.296 0 2.34 0 3.132-.074.764-.071 1.556-.227 2.115-.759a3.32 3.32 0 0 0 .987-2.761c-.134-1.21-.748-2.117-1.485-2.822-.69-.66-1.544-1.195-2.288-1.661l-.083-.053c-.807-.506-1.474-.935-1.954-1.422-.45-.457-.67-.901-.67-1.448a1 1 0 0 0-1-1z"/>
    </svg>
  );
}
