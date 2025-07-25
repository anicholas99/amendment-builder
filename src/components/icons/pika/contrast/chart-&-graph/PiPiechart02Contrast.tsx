import React from 'react';

/**
 * PiPiechart02Contrast icon from the contrast style in chart-&-graph category.
 */
interface PiPiechart02ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechart02Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-02 icon',
  ...props
}: PiPiechart02ContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20.194 11.501a7.424 7.424 0 0 0-9.908-6.998l-.193-.544c-.277-.781-1.142-1.2-1.87-.802a9.5 9.5 0 1 0 12.27 13.878c.484-.674.175-1.585-.567-1.956l-.515-.257c.5-1 .783-2.127.783-3.321Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.286 4.503 2.282 6.428a1.5 1.5 0 0 0 .742.84l6.101 3.05M10.286 4.504a7.424 7.424 0 0 1 9.125 10.32m-9.125-10.32-.193-.544c-.277-.781-1.142-1.2-1.87-.802a9.5 9.5 0 1 0 12.27 13.878c.484-.674.175-1.585-.567-1.956l-.515-.257" fill="none"/>
    </svg>
  );
}
