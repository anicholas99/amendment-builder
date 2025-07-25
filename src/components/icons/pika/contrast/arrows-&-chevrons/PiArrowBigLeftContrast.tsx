import React from 'react';

/**
 * PiArrowBigLeftContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowBigLeftContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigLeftContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-left icon',
  ...props
}: PiArrowBigLeftContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20.997 13.4v-2.8c0-.56 0-.84-.11-1.054a1 1 0 0 0-.436-.437C20.238 9 19.957 9 19.397 9H9.474a61 61 0 0 1 .33-4 35.3 35.3 0 0 0-6.557 6.307 1.11 1.11 0 0 0 0 1.386A35.3 35.3 0 0 0 9.805 19a60 60 0 0 1-.33-4h9.92c.56 0 .84 0 1.055-.109a1 1 0 0 0 .437-.437c.11-.214.11-.494.11-1.054Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.998 10.6v2.8c0 .56 0 .84-.11 1.054a1 1 0 0 1-.437.437c-.213.109-.494.109-1.053.109H9.474q.099 2.005.33 4a35.3 35.3 0 0 1-6.557-6.307 1.11 1.11 0 0 1 0-1.386A35.3 35.3 0 0 1 9.805 5a61 61 0 0 0-.33 4h9.923c.56 0 .84 0 1.053.109a1 1 0 0 1 .438.437c.108.214.108.494.108 1.054Z" fill="none"/>
    </svg>
  );
}
