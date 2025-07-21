import React from 'react';

/**
 * PiLeetcodeDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiLeetcodeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLeetcodeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'leetcode icon',
  ...props
}: PiLeetcodeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6.897 8.904-.037.038c-1.308 1.345-1.961 2.017-2.319 2.738a5.24 5.24 0 0 0 0 4.64c.358.72 1.011 1.393 2.319 2.738s1.961 2.018 2.663 2.385a4.85 4.85 0 0 0 4.51 0c.701-.367 1.355-1.04 2.662-2.385l.002-.001.379-.39M6.896 8.904c1.284-1.32 1.932-1.983 2.627-2.347a4.85 4.85 0 0 1 4.51 0c.701.367 1.355 1.04 2.662 2.385l.38.391M6.898 8.904 13.609 2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.667 14.222h10" fill="none"/>
    </svg>
  );
}
