import React from 'react';

/**
 * PiVscodeDuoSolid icon from the duo-solid style in development category.
 */
interface PiVscodeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVscodeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'vscode icon',
  ...props
}: PiVscodeDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M17.407 2.087A1 1 0 0 1 18 3v4.997a1 1 0 0 1-.39.793l-4.171 3.209 4.17 3.208A1 1 0 0 1 18 16v5a1 1 0 0 1-1.669.743l-7.17-6.452-4.551 3.502a1 1 0 0 1-1.21.007l-2-1.5a1 1 0 0 1-.069-1.543L5.505 12 1.331 8.243A1 1 0 0 1 1.4 6.7l2-1.5a1 1 0 0 1 1.21.007L9.162 8.71l7.169-6.452a1 1 0 0 1 1.076-.17Z" opacity=".28"/><path fill={color || "currentColor"} d="M17.447 2.106A1 1 0 0 0 16 3v18a1 1 0 0 0 1.447.894l3.343-1.67c.53-.265.998-.498 1.353-.86a3 3 0 0 0 .693-1.122c.166-.48.165-1.002.164-1.595V7.353c0-.593.002-1.115-.164-1.595a3 3 0 0 0-.693-1.121c-.355-.363-.822-.596-1.353-.86z"/>
    </svg>
  );
}
