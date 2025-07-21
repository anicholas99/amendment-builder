import React from 'react';

/**
 * PiMapPinAreaDuoSolid icon from the duo-solid style in navigation category.
 */
interface PiMapPinAreaDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapPinAreaDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'map-pin-area icon',
  ...props
}: PiMapPinAreaDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1c-1.464 0-3.378.507-4.946 1.78-1.604 1.302-2.79 3.366-2.79 6.331 0 2.994 1.417 5.45 3.01 7.132a11.4 11.4 0 0 0 2.458 1.98c.754.443 1.576.777 2.269.777s1.514-.334 2.269-.776a11.4 11.4 0 0 0 2.457-1.98c1.593-1.683 3.01-4.14 3.01-7.133 0-2.965-1.186-5.029-2.79-6.332C15.379 1.507 13.465 1 12 1Z" opacity=".28"/><path fill={color || "currentColor"} d="M8.974 8.737a3.026 3.026 0 1 1 6.052 0 3.026 3.026 0 0 1-6.052 0Z"/><path fill={color || "currentColor"} d="M3.98 17.887a1 1 0 0 0-.925-1.774C2.053 16.636 1 17.482 1 18.732c0 .897.557 1.586 1.174 2.063.632.488 1.482.884 2.444 1.198C6.553 22.626 9.163 23 12 23s5.447-.374 7.382-1.007c.962-.314 1.812-.71 2.444-1.198.617-.477 1.174-1.166 1.174-2.063 0-1.25-1.053-2.096-2.055-2.619a1 1 0 1 0-.926 1.774c.418.217.685.424.836.594.145.162.145.243.145.25 0 .006-.003.177-.397.482-.381.294-.995.602-1.843.88-1.684.55-4.075.907-6.76.907s-5.076-.357-6.76-.908c-.848-.277-1.462-.585-1.843-.88-.394-.304-.397-.475-.397-.48 0-.008 0-.088.145-.25.151-.17.418-.378.836-.595Z"/>
    </svg>
  );
}
