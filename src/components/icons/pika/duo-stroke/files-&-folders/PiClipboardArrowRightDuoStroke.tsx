import React from 'react';

/**
 * PiClipboardArrowRightDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiClipboardArrowRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClipboardArrowRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'clipboard-arrow-right icon',
  ...props
}: PiClipboardArrowRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4.039c.784.047 1.34.155 1.816.397a4 4 0 0 1 1.748 1.748C20 7.04 20 8.16 20 10.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C16.96 22 15.84 22 13.6 22h-3.2c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 18.961 4 17.84 4 15.6v-5.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748c.475-.242 1.032-.35 1.816-.397" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.057 16a10 10 0 0 0 1.873-1.802A.32.32 0 0 0 15 14m0 0c0-.07-.023-.14-.07-.198A10 10 0 0 0 13.057 12M15 14H9m1-8h4c.465 0 .697 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06c.05-.186.052-.411.052-.85V4c0-.465 0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C14.697 2 14.464 2 14 2h-4c-.465 0-.697 0-.888.051a1.5 1.5 0 0 0-1.06 1.06C8 3.304 8 3.536 8 4v.038c0 .44.001.665.051.85a1.5 1.5 0 0 0 1.06 1.06C9.304 6 9.536 6 10 6Z" fill="none"/>
    </svg>
  );
}
