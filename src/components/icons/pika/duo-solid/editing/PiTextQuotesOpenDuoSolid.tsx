import React from 'react';

/**
 * PiTextQuotesOpenDuoSolid icon from the duo-solid style in editing category.
 */
interface PiTextQuotesOpenDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTextQuotesOpenDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'text-quotes-open icon',
  ...props
}: PiTextQuotesOpenDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 13.999A9.4 9.4 0 0 1 18 6.3M4 14a9.4 9.4 0 0 1 4-7.7" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M17 17.999a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-10 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" clipRule="evenodd"/>
    </svg>
  );
}
