import React from 'react';

/**
 * PiExchange01Contrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiExchange01ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiExchange01Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'exchange-01 icon',
  ...props
}: PiExchange01ContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M18.574 19.799A14.7 14.7 0 0 0 21 17.352l-.626.062a24 24 0 0 1-4.748 0L15 17.352c.706.905 1.52 1.726 2.426 2.447a.92.92 0 0 0 1.148 0Z" fill="none" stroke="currentColor"/><path d="M5.426 4.201A14.7 14.7 0 0 0 3 6.648l.626-.062a24 24 0 0 1 4.748 0L9 6.648a14.7 14.7 0 0 0-2.426-2.447.92.92 0 0 0-1.148 0Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 17.532V7a3 3 0 1 0-6 0v10a3 3 0 1 1-6 0V6.468m12 11.064q1.19 0 2.374-.118l.626-.062a14.7 14.7 0 0 1-2.426 2.447.92.92 0 0 1-1.148 0A14.7 14.7 0 0 1 15 17.352l.626.062q1.185.117 2.374.118ZM6 6.468a24 24 0 0 0-2.374.118L3 6.648a14.7 14.7 0 0 1 2.426-2.447.92.92 0 0 1 1.148 0C7.48 4.922 8.294 5.743 9 6.648l-.626-.062A24 24 0 0 0 6 6.468Z" fill="none"/>
    </svg>
  );
}
