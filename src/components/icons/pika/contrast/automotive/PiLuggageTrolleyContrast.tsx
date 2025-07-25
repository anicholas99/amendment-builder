import React from 'react';

/**
 * PiLuggageTrolleyContrast icon from the contrast style in automotive category.
 */
interface PiLuggageTrolleyContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLuggageTrolleyContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'luggage-trolley icon',
  ...props
}: PiLuggageTrolleyContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M9 8.7c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C10.52 5.5 11.08 5.5 12.2 5.5h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 7.02 21 7.58 21 8.7v3.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.428.218-.988.218-2.108.218h-5.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C9 13.98 9 13.42 9 12.3z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 19H8M3 3a2 2 0 0 1 2 2v11m0 0a3 3 0 1 0 3 3m-3-3a3 3 0 0 1 3 3m7-13.5h-2.8c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C9 7.02 9 7.58 9 8.7v3.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 13.98 21 13.42 21 12.3V8.7c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 5.5 18.92 5.5 17.8 5.5zm0 0V9" fill="none"/>
    </svg>
  );
}
