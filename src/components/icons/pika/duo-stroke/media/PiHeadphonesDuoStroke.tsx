import React from 'react';

/**
 * PiHeadphonesDuoStroke icon from the duo-stroke style in media category.
 */
interface PiHeadphonesDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeadphonesDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'headphones icon',
  ...props
}: PiHeadphonesDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.024 15.669a9.5 9.5 0 0 1-.536-3.157 9.512 9.512 0 0 1 19.024 0 9.5 9.5 0 0 1-.526 3.128" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.944 19.277 1.05-3.658a2.378 2.378 0 0 0-4.573-1.31l-1.048 3.657a2.378 2.378 0 1 0 4.571 1.31Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.627 17.966 7.58 14.308a2.378 2.378 0 1 0-4.572 1.311l1.049 3.658a2.378 2.378 0 0 0 4.571-1.311Z" fill="none"/>
    </svg>
  );
}
