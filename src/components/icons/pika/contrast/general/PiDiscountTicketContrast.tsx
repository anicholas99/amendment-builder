import React from 'react';

/**
 * PiDiscountTicketContrast icon from the contrast style in general category.
 */
interface PiDiscountTicketContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDiscountTicketContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'discount-ticket icon',
  ...props
}: PiDiscountTicketContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20 20.932V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 2 15.84 2 13.6 2h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4v12.532c0 .208 0 .311.021.366a.31.31 0 0 0 .43.163c.052-.027.12-.104.258-.259L4.89 21c.26-.292.39-.438.513-.54a2 2 0 0 1 2.529 0c.124.102.254.248.513.54.13.146.195.219.257.27a1 1 0 0 0 1.265 0c.062-.051.126-.124.256-.27.26-.292.39-.438.514-.54a2 2 0 0 1 2.528 0c.124.102.254.248.514.54.13.146.194.219.256.27a1 1 0 0 0 1.265 0 3 3 0 0 0 .257-.27c.259-.292.389-.438.513-.54a2 2 0 0 1 2.529 0c.124.102.254.248.513.54l.18.202c.137.155.206.232.258.259a.31.31 0 0 0 .43-.163c.021-.055.021-.158.021-.366Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.818 14.364 15.182 8m-6.114.25h.01m5.854 5.864h.01M9.318 8.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0ZM20 8.4v12.532c0 .208 0 .311-.021.366a.31.31 0 0 1-.43.163c-.052-.027-.12-.104-.258-.259L19.11 21c-.26-.292-.39-.438-.513-.54a2 2 0 0 0-2.529 0c-.124.102-.254.248-.513.54-.13.146-.195.219-.257.27a1 1 0 0 1-1.264 0 3 3 0 0 1-.257-.27c-.26-.292-.39-.438-.514-.54a2 2 0 0 0-2.528 0c-.124.102-.254.248-.514.54-.13.146-.194.219-.256.27a1 1 0 0 1-1.265 0 3 3 0 0 1-.257-.27c-.26-.292-.389-.438-.513-.54a2 2 0 0 0-2.529 0c-.124.102-.254.248-.513.54l-.18.202c-.137.155-.206.232-.258.259a.31.31 0 0 1-.43-.163C4 21.243 4 21.14 4 20.932V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h3.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C20 5.04 20 6.16 20 8.4Z" fill="none"/>
    </svg>
  );
}
