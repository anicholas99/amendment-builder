import React from 'react';

/**
 * PiWindowDockBottomRightDuoSolid icon from the duo-solid style in devices category.
 */
interface PiWindowDockBottomRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWindowDockBottomRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'window-dock-bottom-right icon',
  ...props
}: PiWindowDockBottomRightDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M22 15.2v.041c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.542.044-1.206.044-2.01.044H7.758c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C2 16.71 2 16.046 2 15.242V8.758c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C6.29 3 6.954 3 7.758 3h8.483c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564.044.541.044 1.206.044 2.01z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M13.8 18h-.023c-.12 0-.261 0-.387-.01a1.5 1.5 0 0 1-.571-.154 1.5 1.5 0 0 1-.655-.655 1.5 1.5 0 0 1-.154-.571c-.01-.126-.01-.268-.01-.387v-3.446c0-.12 0-.261.01-.387.012-.145.043-.353.154-.571a1.5 1.5 0 0 1 .655-.655c.218-.112.426-.142.571-.154.125-.01.268-.01.387-.01h3.446c.12 0 .262 0 .387.01.145.012.353.042.571.154a1.5 1.5 0 0 1 .655.655c.112.218.142.426.154.571.01.125.01.268.01.387v3.446c0 .12 0 .261-.01.387a1.5 1.5 0 0 1-.153.571 1.5 1.5 0 0 1-.656.655c-.178.089-.372.14-.571.154a5 5 0 0 1-.387.01z" clipRule="evenodd"/>
    </svg>
  );
}
