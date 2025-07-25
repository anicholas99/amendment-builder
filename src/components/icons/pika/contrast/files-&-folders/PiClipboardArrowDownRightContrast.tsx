import React from 'react';

/**
 * PiClipboardArrowDownRightContrast icon from the contrast style in files-&-folders category.
 */
interface PiClipboardArrowDownRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClipboardArrowDownRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'clipboard-arrow-down-right icon',
  ...props
}: PiClipboardArrowDownRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20 10.4v5.705c0 .248-.29.394-.51.28-1.298-.665-2.919-.422-3.846.831a3 3 0 0 0-.417.784H14a3 3 0 0 0-2.91 3.73c.033.133-.064.27-.202.27H10.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 18.96 4 17.84 4 15.6v-5.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748c.475-.242 1.032-.35 1.816-.398 0 .44.001.665.051.85a1.5 1.5 0 0 0 1.06 1.06C9.304 6 9.536 6 10 6h4c.465 0 .697 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06c.05-.186.052-.411.052-.85.784.047 1.34.155 1.816.397a4 4 0 0 1 1.748 1.748C20 7.04 20 8.16 20 10.4Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4.038V4c0-.465 0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C14.697 2 14.464 2 14 2h-4c-.465 0-.697 0-.888.051a1.5 1.5 0 0 0-1.06 1.06C8 3.304 8 3.536 8 4v.038m8 0c0 .44-.001.665-.051.85a1.5 1.5 0 0 1-1.06 1.06C14.697 6 14.464 6 14 6h-4c-.465 0-.697 0-.888-.051a1.5 1.5 0 0 1-1.06-1.06C8.001 4.702 8 4.477 8 4.038m8 0c.784.047 1.34.155 1.816.397a4 4 0 0 1 1.748 1.748C20 7.04 20 8.16 20 10.4v5.104M8 4.038c-.784.048-1.341.156-1.816.398a4 4 0 0 0-1.748 1.748C4 7.04 4 8.16 4 10.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748c.817.416 1.875.435 3.918.436h.023m7.932 1a10 10 0 0 0 1.873-1.802A.32.32 0 0 0 20 21m0 0c0-.07-.023-.14-.07-.198A10 10 0 0 0 18.057 19M20 21h-6" fill="none"/>
    </svg>
  );
}
