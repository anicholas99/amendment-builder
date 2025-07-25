import React from 'react';

/**
 * PiMaximizeFourArrowContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiMaximizeFourArrowContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMaximizeFourArrowContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'maximize-four-arrow icon',
  ...props
}: PiMaximizeFourArrowContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M4.58 4.077a18.5 18.5 0 0 1 4.753.18l-1.229 1.04a24 24 0 0 0-2.807 2.807l-1.04 1.23a18.5 18.5 0 0 1-.18-4.754.555.555 0 0 1 .503-.503Z" stroke="currentColor"/><path fill="currentColor" d="M14.67 4.257a18.5 18.5 0 0 1 4.753-.18.555.555 0 0 1 .503.503 18.5 18.5 0 0 1-.18 4.753l-1.04-1.229a24 24 0 0 0-2.807-2.807z" stroke="currentColor"/><path fill="currentColor" d="M14.667 19.744c1.58.264 3.178.324 4.753.179a.555.555 0 0 0 .502-.503 18.5 18.5 0 0 0-.179-4.753l-1.04 1.229a24 24 0 0 1-2.807 2.807z" stroke="currentColor"/><path fill="currentColor" d="M9.33 19.744a18.5 18.5 0 0 1-4.753.179.555.555 0 0 1-.503-.503 18.5 18.5 0 0 1 .18-4.753l1.04 1.229A24 24 0 0 0 8.1 18.703z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.58 4.077a18.5 18.5 0 0 1 4.753.18l-1.229 1.04a24 24 0 0 0-2.807 2.807l-1.04 1.23a18.5 18.5 0 0 1-.18-4.754.555.555 0 0 1 .503-.503Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.423 4.077a18.5 18.5 0 0 0-4.753.18l1.23 1.04a24 24 0 0 1 2.806 2.807l1.04 1.23c.266-1.582.326-3.18.18-4.754a.555.555 0 0 0-.503-.503Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.42 19.923a18.5 18.5 0 0 1-4.753-.18l1.229-1.04a24 24 0 0 0 2.807-2.807l1.04-1.23c.265 1.582.325 3.18.18 4.754a.555.555 0 0 1-.503.503Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.577 19.923c1.575.145 3.172.085 4.753-.18l-1.229-1.04a24 24 0 0 1-2.807-2.807l-1.04-1.23a18.5 18.5 0 0 0-.18 4.754.555.555 0 0 0 .503.503Z" fill="none"/>
    </svg>
  );
}
