import React from 'react';

/**
 * PiArrowLeftUpContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowLeftUpContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftUpContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-up icon',
  ...props
}: PiArrowLeftUpContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M5.591 6.432a30.2 30.2 0 0 0 .152 7.797l4.03-4.455 4.456-4.03a30.2 30.2 0 0 0-7.797-.153.95.95 0 0 0-.84.84Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.774 9.774-4.03 4.455a30.2 30.2 0 0 1-.153-7.797.95.95 0 0 1 .84-.84 30.2 30.2 0 0 1 7.798.151zm0 0 8.817 8.817" fill="none"/>
    </svg>
  );
}
