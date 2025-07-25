import React from 'react';

/**
 * PiRefreshContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiRefreshContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRefreshContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'refresh icon',
  ...props
}: PiRefreshContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M17.5 2.47c.51 1.192.861 2.445 1.049 3.727a.48.48 0 0 1-.298.514l-.181.071a15 15 0 0 1-3.57.884l.357-.497a24 24 0 0 0 2.391-4.14z" fill="none" stroke="currentColor"/><path d="M6.5 21.526A15 15 0 0 1 5.45 17.8a.48.48 0 0 1 .298-.515l.18-.07a15 15 0 0 1 3.57-.885l-.357.497a24 24 0 0 0-2.39 4.141z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.909 10.793a8 8 0 0 1-12.064 8.044m-3.687-5.254a8 8 0 0 1 11.996-8.42m-8.31 13.673q-.598 1.038-1.092 2.132l-.252.558A15 15 0 0 1 5.45 17.8a.48.48 0 0 1 .297-.515l.182-.07a15 15 0 0 1 3.57-.885l-.358.497a24 24 0 0 0-1.297 2.01Zm8.31-13.673q.6-1.04 1.094-2.135l.252-.558a15 15 0 0 1 1.048 3.727.48.48 0 0 1-.297.514l-.181.071a15 15 0 0 1-3.57.884l.357-.497q.699-.971 1.297-2.006Z" fill="none"/>
    </svg>
  );
}
