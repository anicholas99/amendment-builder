import React from 'react';

/**
 * PiAlignRightContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiAlignRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'align-right icon',
  ...props
}: PiAlignRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M15.855 12.404a20.8 20.8 0 0 1-3.886 3.68c.22-2.718.22-5.45 0-8.167a20.8 20.8 0 0 1 3.886 3.678.64.64 0 0 1 0 .81Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.134 12H4m8.134 0a51 51 0 0 1-.165 4.083 20.8 20.8 0 0 0 3.886-3.678.64.64 0 0 0 0-.81 20.8 20.8 0 0 0-3.886-3.678q.165 2.038.165 4.083ZM20 19V5" fill="none"/>
    </svg>
  );
}
