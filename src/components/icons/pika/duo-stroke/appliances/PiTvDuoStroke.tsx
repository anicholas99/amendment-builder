import React from 'react';

/**
 * PiTvDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiTvDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTvDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'tv icon',
  ...props
}: PiTvDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 6.4c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656C3.139 4 3.559 4 4.4 4h15.2c.84 0 1.26 0 1.581.163a1.5 1.5 0 0 1 .656.656c.163.32.163.74.163 1.581v9.2c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163H4.4c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656C2 16.861 2 16.441 2 15.6z" opacity=".28" fill="none"/><path fill="none" d="m4.132 19-.964 1.445a1 1 0 0 0 1.664 1.11L6.535 19z"/><path fill="none" d="m17.465 19 1.703 2.555a1 1 0 1 0 1.664-1.11L19.87 19h-2.404Z"/>
    </svg>
  );
}
