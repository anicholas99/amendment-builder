import React from 'react';

/**
 * PiNftBoltMintDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiNftBoltMintDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftBoltMintDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-bolt-mint icon',
  ...props
}: PiNftBoltMintDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.394 2c1.223 0 2.065 0 2.835.252a5 5 0 0 1 1.83 1.069c.597.547 1.006 1.28 1.6 2.341l1.627 2.91c.492.88.85 1.519 1.034 2.148q.04.143.071.285c.14.654.145 1.328.018 1.984-.145.743-.515 1.43-1.049 2.425l-.569 1.06-.015.026-.033.057a3 3 0 0 0-.77-.396 3 3 0 0 0-5.528-1.985l-2 3.25a3 3 0 0 0 1.583 4.41 3 3 0 0 0-.018.163l-.56.001h-2.744c-.739 0-1.329 0-1.817-.039a4.8 4.8 0 0 1-1.14-.213 5 5 0 0 1-1.83-1.069c-.597-.547-1.006-1.28-1.6-2.34l-1.608-2.877c-.562-1.004-.951-1.7-1.108-2.453a5 5 0 0 1 0-2.017c.157-.755.546-1.45 1.108-2.454L4.32 5.662c.593-1.061 1.002-1.794 1.6-2.341a5 5 0 0 1 1.83-1.07C8.518 2 9.36 2 10.583 2z" opacity=".28"/><path fill={color || "currentColor"} d="M8.968 7A2.003 2.003 0 0 0 6.96 9c0 1.111.905 2 2.007 2a2.003 2.003 0 0 0 2.007-2c0-1.111-.905-2-2.007-2Z"/><path fill={color || "currentColor"} d="M18.973 10h.818c.416.755.573 1.087.643 1.421.084.39.087.794.01 1.186-.073.378-.256.756-.787 1.749a3 3 0 0 0-5.213-.18l-2 3.25A3 3 0 0 0 12.172 20h-1.425c-1.449 0-1.946-.012-2.374-.152a3 3 0 0 1-.395-.162 9 9 0 0 1 .03-.558c.426-4.84 4.287-8.668 9.147-9.09.437-.038.944-.038 1.82-.038Z"/><path fill={color || "currentColor"} d="M17.851 16.273a1 1 0 0 0-1.703-1.048l-2 3.25a1 1 0 0 0 .851 1.524h2.21l-1.061 1.726a1 1 0 1 0 1.703 1.048l2-3.25A1 1 0 0 0 19 17.999h-2.21z"/>
    </svg>
  );
}
