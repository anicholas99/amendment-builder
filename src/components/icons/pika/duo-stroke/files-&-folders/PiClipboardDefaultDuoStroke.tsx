import React from 'react';

/**
 * PiClipboardDefaultDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiClipboardDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClipboardDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'clipboard-default icon',
  ...props
}: PiClipboardDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4.038c.784.048 1.34.156 1.816.398a4 4 0 0 1 1.748 1.748C20 7.04 20 8.16 20 10.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C16.96 22 15.84 22 13.6 22h-3.2c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 18.96 4 17.84 4 15.6v-5.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748c.475-.242 1.032-.35 1.816-.398" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4c0-.465 0-.697.051-.888a1.5 1.5 0 0 1 1.06-1.06C9.304 2 9.536 2 10 2h4c.465 0 .697 0 .888.051a1.5 1.5 0 0 1 1.06 1.06C16 3.304 16 3.536 16 4v.038c0 .44-.001.665-.051.85a1.5 1.5 0 0 1-1.06 1.06C14.697 6 14.464 6 14 6h-4c-.465 0-.697 0-.888-.051a1.5 1.5 0 0 1-1.06-1.06C8.001 4.702 8 4.477 8 4.038z" fill="none"/>
    </svg>
  );
}
