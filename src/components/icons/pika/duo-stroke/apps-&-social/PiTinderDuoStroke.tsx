import React from 'react';

/**
 * PiTinderDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiTinderDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTinderDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'tinder icon',
  ...props
}: PiTinderDuoStrokeProps): JSX.Element {
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
      <path fillRule="evenodd" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.827 9.663c3.627-1.25 4.244-4.507 3.781-7.502 0-.108.093-.185.186-.154 3.473 1.698 7.378 5.402 7.378 10.959 0 4.26-3.304 8.026-8.104 8.026A7.717 7.717 0 0 1 7.715 6.684c.093-.062.217 0 .217.108.046.57.2 2.006.833 2.87z" clipRule="evenodd" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.172 12.966c0-5.557-3.906-9.261-7.379-10.96-.092-.03-.185.047-.185.155.463 2.995-.154 6.251-3.781 7.502h-.062c-.633-.865-.787-2.3-.834-2.871 0-.108-.123-.17-.216-.108a7.72 7.72 0 0 0-3.206 3.843" fill="none"/>
    </svg>
  );
}
