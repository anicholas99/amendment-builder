import React from 'react';

/**
 * PiWindowDockTopDuoSolid icon from the duo-solid style in devices category.
 */
interface PiWindowDockTopDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWindowDockTopDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'window-dock-top icon',
  ...props
}: PiWindowDockTopDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M22 15.241c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.542.044-1.206.044-2.01.044H7.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C2 16.71 2 16.046 2 15.242V8.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C6.29 3 6.954 3 7.758 3h8.483c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564.044.541.044 1.206.044 2.01z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M6.777 13c-.12 0-.261 0-.387-.01a1.5 1.5 0 0 1-.571-.154 1.5 1.5 0 0 1-.655-.655 1.5 1.5 0 0 1-.154-.571C5 11.485 5 11.342 5 11.223V7.777c0-.12 0-.262.01-.387.012-.145.042-.353.154-.571a1.5 1.5 0 0 1 .655-.655c.218-.112.426-.142.571-.154.126-.01.268-.01.387-.01h10.446c.12 0 .262 0 .387.01.199.013.393.065.571.153a1.5 1.5 0 0 1 .655.656c.112.218.142.426.154.571.01.125.01.268.01.387v3.446c0 .12 0 .261-.01.387a1.5 1.5 0 0 1-.153.571 1.5 1.5 0 0 1-.656.655 1.5 1.5 0 0 1-.571.154c-.125.01-.268.01-.387.01z" clipRule="evenodd"/>
    </svg>
  );
}
