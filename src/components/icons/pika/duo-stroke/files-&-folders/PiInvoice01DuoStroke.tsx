import React from 'react';

/**
 * PiInvoice01DuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiInvoice01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInvoice01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'invoice-01 icon',
  ...props
}: PiInvoice01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11v8a2 2 0 0 0 2 2m-2-10V4.971c0-.442 0-.663-.04-.821a1.3 1.3 0 0 0-1.46-.963c-.162.025-.365.112-.771.286a6 6 0 0 1-.491.199 3 3 0 0 1-1.511.095 6 6 0 0 1-.512-.134l-.896-.256c-.49-.14-.736-.21-.986-.238a3 3 0 0 0-.666 0c-.25.028-.495.098-.986.238l-.896.256c-.256.073-.384.11-.512.135a3 3 0 0 1-1.51-.096 6 6 0 0 1-.492-.199c-.406-.174-.61-.26-.77-.286a1.3 1.3 0 0 0-1.46.963C3 4.308 3 4.529 3 4.97V15.4c0 1.96 0 2.94.381 3.688a3.5 3.5 0 0 0 1.53 1.53C5.66 21 6.64 21 8.6 21H19m-2-10h2.4c.56 0 .84 0 1.054.11a1 1 0 0 1 .437.436C21 11.76 21 12.04 21 12.6V19a2 2 0 0 1-2 2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.807 9.5C12.6 8.637 11.875 8 11.013 8h-.984M7.25 14.5c.206.863.93 1.5 1.793 1.5h.985m0-8h-.926C8.08 8 7.25 8.895 7.25 10s.83 2 1.852 2h1.852c1.022 0 1.851.895 1.851 2s-.829 2-1.851 2h-.926m0-8V7m0 9v1" fill="none"/>
    </svg>
  );
}
