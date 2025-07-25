import React from 'react';

/**
 * PiBalanceScaleLawDuoSolid icon from the duo-solid style in general category.
 */
interface PiBalanceScaleLawDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBalanceScaleLawDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'balance-scale-law icon',
  ...props
}: PiBalanceScaleLawDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v1.75m8.917 11.812a3.196 3.196 0 0 0 .974-3.917L19 5.5l-2.892 6.145a3.196 3.196 0 0 0 .974 3.917m-10.165 0a3.196 3.196 0 0 0 .974-3.917L5 5.5l-2.892 6.145a3.196 3.196 0 0 0 .974 3.917" opacity=".28"/><path fill={color || "currentColor"} d="M9.032 5.36A7.5 7.5 0 0 1 11 4.816v15.182H8a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-3V4.817c.671.09 1.333.27 1.968.542l1.583.679a5.82 5.82 0 0 0 4.896-.144 1 1 0 0 0-.895-1.79 3.82 3.82 0 0 1-3.214.095l-1.583-.678a9.53 9.53 0 0 0-7.511 0l-1.583.678a3.82 3.82 0 0 1-3.214-.094 1 1 0 1 0-.894 1.789 5.82 5.82 0 0 0 4.896.144z"/><path fill={color || "currentColor"} d="M.804 12.999a1 1 0 0 1 1-.999h6.392a1 1 0 0 1 1 .999 4.195 4.195 0 1 1-8.392 0Z"/><path fill={color || "currentColor"} d="M14.804 12.999a1 1 0 0 1 1-.999h6.392a1 1 0 0 1 1 .999 4.195 4.195 0 1 1-8.392 0Z"/>
    </svg>
  );
}
