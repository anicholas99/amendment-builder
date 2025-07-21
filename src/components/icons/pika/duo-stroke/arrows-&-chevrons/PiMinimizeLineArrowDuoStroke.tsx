import React from 'react';

/**
 * PiMinimizeLineArrowDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiMinimizeLineArrowDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMinimizeLineArrowDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'minimize-line-arrow icon',
  ...props
}: PiMinimizeLineArrowDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.707 11.293 20 4m-8.707 8.707L4 20" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.744 5.599a20.7 20.7 0 0 0-.214 5.31.616.616 0 0 0 .56.561c1.759.158 3.544.086 5.311-.215m-7.145 7.146c.3-1.767.372-3.552.214-5.31a.616.616 0 0 0-.56-.561 20.7 20.7 0 0 0-5.311.214" fill="none"/>
    </svg>
  );
}
