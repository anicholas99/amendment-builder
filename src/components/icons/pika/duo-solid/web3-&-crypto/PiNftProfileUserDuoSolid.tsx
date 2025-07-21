import React from 'react';

/**
 * PiNftProfileUserDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiNftProfileUserDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftProfileUserDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-profile-user icon',
  ...props
}: PiNftProfileUserDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M16.229 2.252C15.459 1.999 14.617 2 13.394 2h-2.81c-1.223 0-2.065 0-2.835.252A5 5 0 0 0 5.92 3.32c-.597.547-1.006 1.28-1.6 2.341L2.712 8.538c-.562 1.004-.951 1.7-1.108 2.454a5 5 0 0 0 0 2.017c.157.754.546 1.449 1.108 2.453l1.609 2.876c.593 1.061 1.002 1.794 1.6 2.341.527.482 1.15.847 1.83 1.07C8.518 22 9.36 22 10.583 22h2.866c1.205 0 2.035 0 2.796-.245a5 5 0 0 0 1.814-1.044c.594-.534 1.008-1.251 1.607-2.289l1.11-1.922.014-.027.569-1.059c.534-.994.904-1.682 1.049-2.425a5 5 0 0 0-.018-1.984c-.157-.74-.539-1.422-1.09-2.407l-1.643-2.936c-.593-1.061-1.002-1.794-1.6-2.341a5 5 0 0 0-1.83-1.07Z" opacity=".28"/><path fill={color || "currentColor"} d="M12 6.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"/><path fill={color || "currentColor"} d="M10 13.25A2.75 2.75 0 0 0 7.25 16c0 .966.784 1.75 1.75 1.75h6A1.75 1.75 0 0 0 16.75 16 2.75 2.75 0 0 0 14 13.25z"/>
    </svg>
  );
}
