import React from 'react';

/**
 * PiWashingMachineDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiWashingMachineDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWashingMachineDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'washing-machine icon',
  ...props
}: PiWashingMachineDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C18.48 2 17.92 2 16.8 2H7.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C4 3.52 4 4.08 4 5.2V8m16 0v10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 22 17.92 22 16.8 22H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 20.48 4 19.92 4 18.8V8m16 0H4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5h2m5 0h.01M17 5h.01M16 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
