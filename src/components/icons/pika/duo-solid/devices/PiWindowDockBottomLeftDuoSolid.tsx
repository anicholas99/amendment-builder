import React from 'react';

/**
 * PiWindowDockBottomLeftDuoSolid icon from the duo-solid style in devices category.
 */
interface PiWindowDockBottomLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWindowDockBottomLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'window-dock-bottom-left icon',
  ...props
}: PiWindowDockBottomLeftDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M2 15.2v.041c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C6.29 21 6.954 21 7.758 21h8.484c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.043-.542.043-1.206.043-2.01V8.758c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C17.71 3 17.046 3 16.242 3H7.759c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C2 7.289 2 7.954 2 8.758z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M10.2 18h.023c.12 0 .261 0 .387-.01.199-.013.393-.065.571-.154a1.5 1.5 0 0 0 .655-.655 1.5 1.5 0 0 0 .154-.571c.01-.126.01-.268.01-.387v-3.446c0-.12 0-.261-.01-.387a1.5 1.5 0 0 0-.154-.571 1.5 1.5 0 0 0-.655-.655 1.5 1.5 0 0 0-.571-.154c-.125-.01-.268-.01-.387-.01H6.777c-.12 0-.262 0-.387.01a1.5 1.5 0 0 0-.571.154 1.5 1.5 0 0 0-.655.655 1.5 1.5 0 0 0-.154.571c-.01.125-.01.268-.01.387v3.446c0 .12 0 .261.01.387.013.199.065.393.153.571a1.5 1.5 0 0 0 .656.655c.178.089.372.14.571.154q.194.012.387.01z" clipRule="evenodd"/>
    </svg>
  );
}
