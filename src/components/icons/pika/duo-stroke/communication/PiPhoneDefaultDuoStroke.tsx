import React from 'react';

/**
 * PiPhoneDefaultDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiPhoneDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhoneDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'phone-default icon',
  ...props
}: PiPhoneDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.407 12.974a15.8 15.8 0 0 0 5.307 5.43" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.408 12.974C4.17 10.877 3.356 8.433 3.035 5.709c-.14-1.196.6-2.455 1.863-2.662.396-.064.887-.055 1.29-.018 1.683.152 2.379 1.637 2.748 3.079a5.43 5.43 0 0 1-1.57 5.332c-.604.56-1.305 1.032-1.958 1.534Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.288 20.965c-2.858-.337-5.41-1.217-7.573-2.56.632-.728 1.23-1.532 1.943-2.181a5.43 5.43 0 0 1 4.867-1.276c1.52.349 3.225 1.018 3.435 2.788.051.435.06.933-.011 1.366-.206 1.262-1.465 2.004-2.661 1.863Z" fill="none"/>
    </svg>
  );
}
