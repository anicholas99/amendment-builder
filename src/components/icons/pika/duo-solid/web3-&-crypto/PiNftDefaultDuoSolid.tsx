import React from 'react';

/**
 * PiNftDefaultDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiNftDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-default icon',
  ...props
}: PiNftDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M16.229 2.252C15.459 1.999 14.617 2 13.394 2h-2.81c-1.223 0-2.065 0-2.835.252A5 5 0 0 0 5.92 3.32c-.597.547-1.006 1.28-1.6 2.341L2.712 8.538c-.562 1.004-.951 1.7-1.108 2.454a5 5 0 0 0 0 2.017c.157.754.546 1.449 1.108 2.453l1.609 2.876c.593 1.061 1.002 1.794 1.6 2.341.527.482 1.15.847 1.83 1.07.367.12.735.18 1.14.212.487.04 1.077.04 1.816.04h2.744c1.205 0 2.035 0 2.796-.246a5 5 0 0 0 1.814-1.044c.594-.534 1.008-1.251 1.607-2.289l1.11-1.922.014-.027.569-1.059c.534-.994.904-1.682 1.049-2.425a5 5 0 0 0-.09-2.269c-.183-.63-.54-1.269-1.033-2.149l-1.628-2.909c-.593-1.061-1.002-1.794-1.6-2.341a5 5 0 0 0-1.83-1.07Z" opacity=".28"/><path fill={color || "currentColor"} d="M18.973 10h.818c.416.755.573 1.087.643 1.421.084.39.087.794.01 1.186-.078.408-.285.815-.918 1.994l-.49.912-1.022 1.77c-.71 1.23-.963 1.645-1.291 1.94a3 3 0 0 1-1.093.629c-.423.136-.913.148-2.34.148h-2.544c-1.449 0-1.946-.012-2.374-.152a3 3 0 0 1-.395-.162 9 9 0 0 1 .03-.558c.426-4.84 4.287-8.668 9.147-9.09.437-.038.944-.038 1.82-.038Z"/><path fill={color || "currentColor"} d="M8.968 7A2.003 2.003 0 0 0 6.96 9c0 1.111.905 2 2.007 2a2.003 2.003 0 0 0 2.007-2c0-1.111-.905-2-2.007-2Z"/>
    </svg>
  );
}
