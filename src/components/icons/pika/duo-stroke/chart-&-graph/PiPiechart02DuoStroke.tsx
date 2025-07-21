import React from 'react';

/**
 * PiPiechart02DuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiPiechart02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechart02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-02 icon',
  ...props
}: PiPiechart02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.411 14.822-6.1-3.05a1.5 1.5 0 0 1-.744-.84l-2.28-6.43a7.424 7.424 0 0 1 9.125 10.32Zm0 0 .515.257" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.269 11.5a9.5 9.5 0 0 0 17.224 5.534c.484-.673.175-1.584-.567-1.955l-6.616-3.308a1.5 1.5 0 0 1-.742-.84L10.093 3.96c-.277-.781-1.142-1.2-1.87-.802A9.5 9.5 0 0 0 3.27 11.5Z" fill="none"/>
    </svg>
  );
}
