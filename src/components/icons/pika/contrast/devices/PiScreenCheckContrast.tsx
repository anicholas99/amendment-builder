import React from 'react';

/**
 * PiScreenCheckContrast icon from the contrast style in devices category.
 */
interface PiScreenCheckContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScreenCheckContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'screen-check icon',
  ...props
}: PiScreenCheckContrastProps): JSX.Element {
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
      <path fill="currentColor" fillRule="evenodd" d="m22 5.933-.005.006H22zm-.866 1.07H22V14.6c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.655c-.32.164-.74.164-1.581.164H4.4c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656C2 15.861 2 15.441 2 14.6V4.4c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656C3.139 2 3.559 2 4.4 2h9.11v.585a3 3 0 0 0 .37 3.796l2.036 2.034a3 3 0 0 0 4.724-.633q.23-.401.494-.778z" clipRule="evenodd" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.694 2H4.4c-.84 0-1.26 0-1.581.164a1.5 1.5 0 0 0-.656.655C2 3.14 2 3.56 2 4.4v10.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163H12m10-9.484V14.6c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163H12m0 3.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 4.259 2.036 2.034A13 13 0 0 1 22 2" fill="none"/>
    </svg>
  );
}
