import React from 'react';

/**
 * PiFacebookMessengerDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiFacebookMessengerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFacebookMessengerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'facebook-messenger icon',
  ...props
}: PiFacebookMessengerDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M2 11.73C2 6.127 6.415 2 12 2s10 4.13 10 9.732c0 5.603-4.415 9.73-10 9.73a11 11 0 0 1-2.773-.356l-1.697.748a1.72 1.72 0 0 1-2.413-1.521l-.046-1.48C3.161 17.1 2 14.592 2 11.73Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="m8 14 2.165-3.031a.5.5 0 0 1 .752-.071l2.3 2.193a.5.5 0 0 0 .76-.083L16 10"/>
    </svg>
  );
}
