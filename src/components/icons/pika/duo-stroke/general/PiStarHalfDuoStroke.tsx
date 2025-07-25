import React from 'react';

/**
 * PiStarHalfDuoStroke icon from the duo-stroke style in general category.
 */
interface PiStarHalfDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStarHalfDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'star-half icon',
  ...props
}: PiStarHalfDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.711 8.019c-1.938.255-2.907.383-3.382.807a2.06 2.06 0 0 0-.642 1.975c.135.621.844 1.294 2.262 2.64.42.4.63.599.773.833.167.275.268.585.294.906.023.273-.03.558-.136 1.128-.356 1.922-.534 2.884-.277 3.465.3.68.941 1.146 1.68 1.221.633.064 1.492-.402 3.21-1.335.51-.276.764-.414 1.03-.478q.236-.055.477-.055V3c-.359 0-.717.093-1.038.28-.55.32-.97 1.203-1.813 2.967-.25.523-.374.785-.553.993-.21.244-.473.436-.77.56-.253.105-.54.143-1.115.219Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.687 10.802a2.06 2.06 0 0 1 .642-1.976m3.954 12.169a2.06 2.06 0 0 1-1.68-1.221" fill="none"/>
    </svg>
  );
}
