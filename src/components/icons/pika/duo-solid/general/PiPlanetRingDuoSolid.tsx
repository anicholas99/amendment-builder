import React from 'react';

/**
 * PiPlanetRingDuoSolid icon from the duo-solid style in general category.
 */
interface PiPlanetRingDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlanetRingDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'planet-ring icon',
  ...props
}: PiPlanetRingDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M3 12a9 9 0 0 1 17.828-1.757l-.022.016c-1.834 1.34-4.464 2.916-7.458 4.422s-5.827 2.678-7.997 3.351l-.024.007A8.97 8.97 0 0 1 3 12Zm4.11 7.556a9 9 0 0 0 13.872-6.977c-1.835 1.243-4.17 2.598-6.735 3.89-2.566 1.29-5.045 2.355-7.137 3.087Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M3.172 13.758c-.823.603-1.508 1.175-1.995 1.686-.293.307-.559.637-.729.976-.157.312-.343.861-.062 1.421.259.514.747.705 1.077.778.345.076.728.074 1.1.04.752-.068 1.711-.294 2.788-.628 2.17-.673 5.003-1.845 7.997-3.35 2.994-1.507 5.624-3.082 7.458-4.423.91-.665 1.664-1.3 2.167-1.864.249-.278.479-.585.623-.907.139-.308.276-.815.018-1.328-.282-.56-.834-.738-1.178-.798-.374-.065-.798-.049-1.218.003-.702.087-1.57.296-2.544.597A9 9 0 0 1 19.9 7.685q.721-.2 1.257-.29c-.37.353-.883.775-1.531 1.249-1.72 1.257-4.25 2.777-7.177 4.25s-5.655 2.595-7.69 3.227c-.768.238-1.411.398-1.916.484q.393-.375.982-.835a9 9 0 0 1-.653-2.012Z" clipRule="evenodd"/>
    </svg>
  );
}
