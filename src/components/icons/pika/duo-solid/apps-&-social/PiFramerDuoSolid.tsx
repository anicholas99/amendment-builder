import React from 'react';

/**
 * PiFramerDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiFramerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFramerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'framer icon',
  ...props
}: PiFramerDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M6.397 1c-.306 0-.597 0-.828.02-.192.016-.622.058-.963.366a1.5 1.5 0 0 0-.481 1.324c.064.455.367.763.503.899.165.163.388.35.623.547L9.247 7.5H7.364c-.39 0-.74 0-1.03.024a2.5 2.5 0 0 0-.969.248 2.5 2.5 0 0 0-1.093 1.093 2.5 2.5 0 0 0-.248.968C4 10.125 4 10.475 4 10.863V15a1 1 0 0 0 1 1h12.632c.307 0 .6 0 .831-.02.192-.016.624-.058.965-.366a1.5 1.5 0 0 0 .48-1.327c-.065-.455-.37-.763-.507-.899-.165-.163-.39-.35-.626-.546L14.763 9.5h1.873c.39 0 .74 0 1.03-.024.313-.025.644-.083.969-.248a2.5 2.5 0 0 0 1.092-1.093 2.5 2.5 0 0 0 .25-.968C20 6.875 20 6.525 20 6.137V4.363c0-.39 0-.74-.024-1.03a2.5 2.5 0 0 0-.248-.969 2.5 2.5 0 0 0-1.093-1.093 2.5 2.5 0 0 0-.968-.248C17.375 1 17.025 1 16.637 1z" opacity=".28"/><path fill={color || "currentColor"} d="M13 16H5a1 1 0 0 1-.753-.341l5.624 6.426c.195.223.382.437.546.595.139.133.448.421.896.478a1.5 1.5 0 0 0 1.308-.492c.3-.337.343-.758.36-.95.02-.226.02-.51.02-.807z"/>
    </svg>
  );
}
