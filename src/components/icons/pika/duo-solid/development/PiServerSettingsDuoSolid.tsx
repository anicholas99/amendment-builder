import React from 'react';

/**
 * PiServerSettingsDuoSolid icon from the duo-solid style in development category.
 */
interface PiServerSettingsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerSettingsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'server-settings icon',
  ...props
}: PiServerSettingsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} fillRule="evenodd" d="M5.4 3A3.4 3.4 0 0 0 2 6.4v1.2A3.4 3.4 0 0 0 5.4 11h13.2A3.4 3.4 0 0 0 22 7.6V6.4A3.4 3.4 0 0 0 18.6 3z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M13.102 13a3 3 0 0 0-.93 2.14l-.005.444-.31.317a3 3 0 0 0 0 4.198l.31.317.005.444q0 .07.004.14H5.4A3.4 3.4 0 0 1 2 17.6v-1.2A3.4 3.4 0 0 1 5.4 13z"/></g><path fill={color || "currentColor"} d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M17.3 13.286a1 1 0 0 1 1.4 0l.891.873 1.248.013a1 1 0 0 1 .99.99l.012 1.247.873.891a1 1 0 0 1 0 1.4l-.873.891-.013 1.248a1 1 0 0 1-.99.99l-1.247.012-.891.873a1 1 0 0 1-1.4 0l-.891-.873-1.248-.013a1 1 0 0 1-.99-.99l-.012-1.247-.873-.891a1 1 0 0 1 0-1.4l.873-.891.013-1.248a1 1 0 0 1 .99-.99l1.247-.012zM18 15.4l-.479.469a1 1 0 0 1-.69.285l-.67.007-.007.67a1 1 0 0 1-.285.69l-.47.479.47.479a1 1 0 0 1 .285.69l.007.67.67.007a1 1 0 0 1 .69.285l.479.47.479-.47a1 1 0 0 1 .69-.285l.67-.007.007-.67a1 1 0 0 1 .285-.69l.47-.479-.47-.479a1 1 0 0 1-.285-.69l-.007-.67-.67-.007a1 1 0 0 1-.69-.285z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M13 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/><path fill={color || "currentColor"} d="M17 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
    </svg>
  );
}
