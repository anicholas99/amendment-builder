import React from 'react';

/**
 * PiPhoneOutgoingContrast icon from the contrast style in communication category.
 */
interface PiPhoneOutgoingContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhoneOutgoingContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'phone-outgoing icon',
  ...props
}: PiPhoneOutgoingContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M5.407 12.974c-1.237-2.097-2.05-4.541-2.372-7.265-.141-1.196.6-2.455 1.862-2.662.397-.064.887-.055 1.29-.018 1.684.152 2.38 1.637 2.749 3.079a5.43 5.43 0 0 1-1.57 5.332c-.605.56-1.305 1.032-1.959 1.534Z" fill="none" stroke="currentColor"/><path d="M18.287 20.965c-2.858-.337-5.408-1.217-7.572-2.56.632-.728 1.229-1.532 1.943-2.181a5.43 5.43 0 0 1 4.866-1.276c1.521.349 3.226 1.018 3.435 2.788.052.435.06.933-.01 1.366-.207 1.262-1.466 2.004-2.662 1.863Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.889 8.353a14.7 14.7 0 0 0-.007-3.647.68.68 0 0 0-.192-.397m-4.044-.199a14.7 14.7 0 0 1 3.647.007c.156.02.293.089.397.192m-4.95 4.95 4.95-4.95M5.407 12.974c-1.237-2.097-2.05-4.541-2.372-7.265-.141-1.196.6-2.455 1.862-2.662.397-.064.887-.055 1.29-.018 1.684.152 2.38 1.637 2.749 3.079a5.43 5.43 0 0 1-1.57 5.332c-.605.56-1.305 1.032-1.959 1.534Zm0 0a15.8 15.8 0 0 0 5.308 5.43m0 0c2.164 1.344 4.714 2.224 7.572 2.561 1.196.141 2.455-.6 2.662-1.863.07-.433.062-.93.01-1.366-.21-1.77-1.913-2.44-3.435-2.788a5.43 5.43 0 0 0-4.866 1.276c-.714.65-1.311 1.453-1.943 2.18Z" fill="none"/>
    </svg>
  );
}
