import React from 'react';

/**
 * PiForkKnifeContrast icon from the contrast style in food category.
 */
interface PiForkKnifeContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiForkKnifeContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'fork-knife icon',
  ...props
}: PiForkKnifeContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M19.004 3.83v12.244c-.624 0-.936 0-1.19-.044a3 3 0 0 1-2.476-2.693c-.022-.258.004-.569.055-1.19l.491-5.9a4.15 4.15 0 0 1 1.831-3.106.829.829 0 0 1 1.288.69Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 3-.453 3.624A3.48 3.48 0 0 0 8 10.536M11 3l.453 3.624A3.48 3.48 0 0 1 8 10.536m0 0V21m0-10.464V3m11.003 18v-4.926m0 0V3.83a.829.829 0 0 0-1.288-.69 4.15 4.15 0 0 0-1.83 3.106l-.492 5.9c-.052.621-.078.932-.055 1.19a3 3 0 0 0 2.476 2.693c.255.044.566.044 1.19.044Z" fill="none"/>
    </svg>
  );
}
