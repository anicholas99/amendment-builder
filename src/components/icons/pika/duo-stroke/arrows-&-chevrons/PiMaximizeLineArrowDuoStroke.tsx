import React from 'react';

/**
 * PiMaximizeLineArrowDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiMaximizeLineArrowDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMaximizeLineArrowDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'maximize-line-arrow icon',
  ...props
}: PiMaximizeLineArrowDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.736 4.264 4.264 19.736" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.714 9.943a20.6 20.6 0 0 0 .2-5.296.62.62 0 0 0-.56-.56 20.6 20.6 0 0 0-5.297.199m-9.771 9.771a20.6 20.6 0 0 0-.2 5.296.62.62 0 0 0 .56.56c1.755.163 3.535.096 5.297-.199" fill="none"/>
    </svg>
  );
}
