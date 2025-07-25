import React from 'react';

/**
 * PiUturnLeftContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiUturnLeftContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUturnLeftContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'uturn-left icon',
  ...props
}: PiUturnLeftContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4.145 7.595A20.8 20.8 0 0 1 8.03 3.916l-.171 2.32a24 24 0 0 0 0 3.527l.17 2.32a20.8 20.8 0 0 1-3.885-3.68.64.64 0 0 1 0-.808Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.795 8H15a5 5 0 1 1 0 10h-3M7.795 8q0-.884.065-1.764l.17-2.32a20.8 20.8 0 0 0-3.885 3.679.64.64 0 0 0 0 .809 20.8 20.8 0 0 0 3.886 3.679l-.171-2.32A24 24 0 0 1 7.795 8Z" fill="none"/>
    </svg>
  );
}
