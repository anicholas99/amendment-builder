import React from 'react';

/**
 * PiFile02SVGFormatContrast icon from the contrast style in files-&-folders category.
 */
interface PiFile02SVGFormatContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02SVGFormatContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-svg-format icon',
  ...props
}: PiFile02SVGFormatContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4 11V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v1z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 2h1a8 8 0 0 1 8 8h-.17A3 3 0 0 0 17 8h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3Zm0 0H8a4 4 0 0 0-4 4v4m17.25 5c-.451-.619-1.069-1-1.75-1-1.38 0-2.5 1.567-2.5 3.5s1.12 3.5 2.5 3.5c.681 0 1.299-.381 1.75-1v-2h-.75M7 14H4.75a1.75 1.75 0 1 0 0 3.5h1.5a1.75 1.75 0 1 1 0 3.5H3m7-7 1.55 7h1.552l1.55-7" fill="none"/>
    </svg>
  );
}
