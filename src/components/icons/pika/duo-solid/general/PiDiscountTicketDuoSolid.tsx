import React from 'react';

/**
 * PiDiscountTicketDuoSolid icon from the duo-solid style in general category.
 */
interface PiDiscountTicketDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDiscountTicketDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'discount-ticket icon',
  ...props
}: PiDiscountTicketDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M10.4 1h-.043C9.273 1 8.4 1 7.691 1.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 3.544 3.73c-.302.592-.428 1.233-.487 1.961C3 6.4 3 7.273 3 8.357v12.591c0 .09 0 .188.004.27v.003c.003.066.011.25.086.442a1.31 1.31 0 0 0 1.814.69 1.4 1.4 0 0 0 .358-.274l.002-.002a5 5 0 0 0 .182-.199l.01-.012.18-.202c.287-.322.352-.39.398-.428a1 1 0 0 1 1.265 0c.046.037.112.106.398.428l.029.033c.097.11.216.244.343.347a2 2 0 0 0 2.529 0c.127-.103.245-.237.343-.347l.029-.033c.286-.322.352-.39.398-.428a1 1 0 0 1 1.264 0c.046.037.112.106.398.428l.029.033a3 3 0 0 0 .343.347 2 2 0 0 0 2.529 0c.127-.103.246-.237.343-.347l.029-.033c.287-.322.352-.39.398-.428a1 1 0 0 1 1.264 0c.047.037.112.106.399.428.122.138.243.281.372.413l.002.002c.046.048.175.18.358.273a1.31 1.31 0 0 0 1.814-.69c.075-.191.083-.375.086-.441v-.003c.004-.082.004-.18.004-.27V8.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.961a5 5 0 0 0-2.185-2.185c-.592-.302-1.232-.428-1.961-.487C15.6 1 14.727 1 13.643 1z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.818 14.364 15.182 8m-6.114.25h.01m5.854 5.864h.01M9.318 8.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Z"/>
    </svg>
  );
}
