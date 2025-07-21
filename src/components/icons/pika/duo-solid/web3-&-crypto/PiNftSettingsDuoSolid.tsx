import React from 'react';

/**
 * PiNftSettingsDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiNftSettingsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftSettingsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-settings icon',
  ...props
}: PiNftSettingsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M13.394 2c1.223 0 2.065 0 2.835.252a5 5 0 0 1 1.83 1.069c.597.547 1.006 1.28 1.6 2.341l1.627 2.91c.492.88.85 1.519 1.034 2.148q.04.143.071.285c.116.543.14 1.1.07 1.65a3 3 0 0 0-1.601-.483l-.444-.005-.317-.31a3 3 0 0 0-4.198 0l-.317.31-.444.005a3 3 0 0 0-2.968 2.968l-.005.444-.31.317a3 3 0 0 0 0 4.198l.31.317.005.444c.004.404.088.79.237 1.14h-1.703c-.739 0-1.329 0-1.817-.039a4.8 4.8 0 0 1-1.14-.213 5 5 0 0 1-1.83-1.069c-.597-.547-1.006-1.28-1.6-2.34l-1.608-2.877c-.562-1.004-.951-1.7-1.108-2.453a5 5 0 0 1 0-2.017c.157-.755.546-1.45 1.108-2.454L4.32 5.662c.593-1.061 1.002-1.794 1.6-2.341a5 5 0 0 1 1.83-1.07C8.518 2 9.36 2 10.583 2z"/><path fill={color || "currentColor"} d="m18.087 18-.026.061-.061.026-.061-.026-.026-.061.026-.061.061-.026.061.026z"/></g><path fill={color || "currentColor"} d="M8.968 7A2.003 2.003 0 0 0 6.96 9c0 1.111.905 2 2.007 2a2.003 2.003 0 0 0 2.007-2c0-1.111-.905-2-2.007-2Z"/><path fill={color || "currentColor"} d="M18.973 10h.818c.416.755.573 1.087.643 1.421q.08.37.063.747h-.08l-.318-.311a3 3 0 0 0-4.198 0l-.317.31-.444.005a3 3 0 0 0-2.968 2.968l-.005.444-.31.317A3 3 0 0 0 11.764 20h-1.018c-1.449 0-1.946-.012-2.374-.152a3 3 0 0 1-.395-.162 9 9 0 0 1 .03-.558c.426-4.84 4.287-8.668 9.147-9.09.437-.038.944-.038 1.82-.038Z"/><path fill={color || "currentColor"} d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M18.7 13.286a1 1 0 0 0-1.4 0l-.891.873-1.248.013a1 1 0 0 0-.99.99l-.012 1.247-.873.891a1 1 0 0 0 0 1.4l.873.891.013 1.248a1 1 0 0 0 .99.99l1.247.012.891.873a1 1 0 0 0 1.4 0l.891-.873 1.248-.013a1 1 0 0 0 .99-.99l.012-1.247.873-.891a1 1 0 0 0 0-1.4l-.873-.891-.013-1.248a1 1 0 0 0-.99-.99l-1.247-.012zm-1.179 2.583.479-.47.479.47a1 1 0 0 0 .69.285l.67.007.007.67a1 1 0 0 0 .285.69l.47.479-.47.479a1 1 0 0 0-.285.69l-.007.67-.67.007a1 1 0 0 0-.69.285l-.479.47-.479-.47a1 1 0 0 0-.69-.285l-.67-.007-.007-.67a1 1 0 0 0-.285-.69l-.47-.479.47-.479a1 1 0 0 0 .285-.69l.007-.67.67-.007a1 1 0 0 0 .69-.285Z"/>
    </svg>
  );
}
