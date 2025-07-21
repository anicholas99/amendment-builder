import React from 'react';

/**
 * PiCakeDuoStroke icon from the duo-stroke style in food category.
 */
interface PiCakeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCakeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'cake icon',
  ...props
}: PiCakeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a1.21 1.21 0 0 1-1.157-.726c-.434-.967-1.808-.967-2.241 0-.434.968-1.807.968-2.24 0-.434-.967-1.808-.967-2.242 0-.433.968-1.807.968-2.24 0-.434-.967-1.808-.967-2.241 0-.434.968-1.807.968-2.24 0-.434-.967-1.808-.967-2.242 0A1.21 1.21 0 0 1 3 15m9-10v3M7 5v3.002M17 5v3.002" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 2v.01M12 2v.01M17 2v.01M21 20H3m18 0h1m-1 0v-7.2c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311c-.53-.27-1.197-.317-2.362-.325q-.366-.003-.8-.002H7.8q-.434 0-.8.002c-1.165.008-1.831.055-2.362.325a3 3 0 0 0-1.311 1.311C3 10.28 3 11.12 3 12.8V20m0 0H2" fill="none"/>
    </svg>
  );
}
