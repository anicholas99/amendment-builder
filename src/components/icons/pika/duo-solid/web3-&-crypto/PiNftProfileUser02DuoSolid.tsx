import React from 'react';

/**
 * PiNftProfileUser02DuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiNftProfileUser02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNftProfileUser02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'nft-profile-user-02 icon',
  ...props
}: PiNftProfileUser02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M16.229 2.252C15.459 1.999 14.617 2 13.394 2h-2.81c-1.223 0-2.065 0-2.835.252A5 5 0 0 0 5.92 3.32c-.597.547-1.006 1.28-1.6 2.341L2.712 8.538c-.562 1.004-.951 1.7-1.108 2.454a5 5 0 0 0 0 2.017c.157.754.546 1.449 1.108 2.453l1.609 2.876c.593 1.061 1.002 1.794 1.6 2.341.527.482 1.15.847 1.83 1.07C8.518 22 9.36 22 10.583 22h2.866c1.205 0 2.035 0 2.796-.245a5 5 0 0 0 1.814-1.044c.594-.534 1.008-1.251 1.607-2.289.576-.998 1.148-1.993 1.693-3.008.534-.994.904-1.682 1.049-2.425a5 5 0 0 0-.018-1.984c-.157-.74-.539-1.422-1.09-2.407l-1.643-2.936c-.593-1.061-1.002-1.794-1.6-2.341a5 5 0 0 0-1.83-1.07Z" opacity=".28"/><path fill={color || "currentColor"} d="M8.5 10a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm6.5 5c1.38 0 2.596.699 3.315 1.762l-.3.522c-.711 1.23-.964 1.644-1.292 1.939a3 3 0 0 1-1.093.629c-.423.136-.913.148-2.34.148h-2.544c-1.448 0-1.946-.012-2.374-.152a3 3 0 0 1-1.102-.644c-.33-.302-.58-.726-1.284-1.984l-.277-.495A4 4 0 0 1 8.999 15z"/>
    </svg>
  );
}
