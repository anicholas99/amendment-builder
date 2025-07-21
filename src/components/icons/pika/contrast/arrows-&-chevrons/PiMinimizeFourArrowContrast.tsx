import React from 'react';

/**
 * PiMinimizeFourArrowContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiMinimizeFourArrowContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMinimizeFourArrowContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'minimize-four-arrow icon',
  ...props
}: PiMinimizeFourArrowContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M8.753 9.256A18.5 18.5 0 0 1 4 9.076l1.23-1.04a24 24 0 0 0 2.806-2.807L9.076 4c.266 1.58.326 3.179.18 4.753a.555.555 0 0 1-.503.503Z" stroke="currentColor"/><path fill="currentColor" d="M20.003 9.077a18.5 18.5 0 0 1-4.753.179.555.555 0 0 1-.503-.503A18.5 18.5 0 0 1 14.927 4l1.04 1.23a24 24 0 0 0 2.807 2.806z" stroke="currentColor"/><path fill="currentColor" d="M8.756 14.744a18.5 18.5 0 0 0-4.753.179l1.23 1.04a24 24 0 0 1 2.806 2.808L9.08 20c.265-1.581.325-3.179.18-4.753a.555.555 0 0 0-.504-.503Z" stroke="currentColor"/><path fill="currentColor" d="M15.247 14.744a18.5 18.5 0 0 1 4.753.179l-1.23 1.04a24 24 0 0 0-2.806 2.808L14.924 20a18.5 18.5 0 0 1-.18-4.753.555.555 0 0 1 .503-.503Z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.247 14.744a18.5 18.5 0 0 1 4.753.179l-1.23 1.04a24 24 0 0 0-2.806 2.808L14.924 20a18.5 18.5 0 0 1-.18-4.753.555.555 0 0 1 .503-.503Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.756 14.744a18.5 18.5 0 0 0-4.753.179l1.23 1.04a24 24 0 0 1 2.806 2.808L9.08 20c.265-1.581.325-3.179.18-4.753a.555.555 0 0 0-.504-.503Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.25 9.256c1.575.146 3.172.086 4.753-.18l-1.229-1.04a24 24 0 0 1-2.807-2.807L14.927 4a18.5 18.5 0 0 0-.18 4.753.555.555 0 0 0 .503.503Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.753 9.256A18.5 18.5 0 0 1 4 9.076l1.23-1.04a24 24 0 0 0 2.806-2.807L9.076 4c.266 1.58.326 3.179.18 4.753a.555.555 0 0 1-.503.503Z" fill="none"/>
    </svg>
  );
}
