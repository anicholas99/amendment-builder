import React from 'react';

/**
 * PiServerCancelContrast icon from the contrast style in development category.
 */
interface PiServerCancelContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerCancelContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'server-cancel icon',
  ...props
}: PiServerCancelContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M6.108 12.022C6.303 12 6.536 12 7 12c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 8.697 3 8.464 3 8s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086C6.303 4 6.536 4 7 4h10c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086C21 7.303 21 7.536 21 8s0 .697-.022.892a3.5 3.5 0 0 1-3.086 3.086C17.697 12 17.464 12 17 12c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 1.98.905l-.227.396c-.277.14-.536.325-.766.556l-.379.378-.379-.378a3 3 0 1 0-4.242 4.242l.378.379-.378.379A3 3 0 0 0 13.17 20H7c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 16.697 3 16.464 3 16s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12h10M7 12c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086C3 15.303 3 15.536 3 16s0 .697.022.892a3.5 3.5 0 0 0 3.086 3.086C6.303 20 6.536 20 7 20h5.168M7 12c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 8.697 3 8.464 3 8s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086C6.303 4 6.536 4 7 4h10c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086C21 7.303 21 7.536 21 8s0 .697-.022.892a3.5 3.5 0 0 1-3.086 3.086C17.697 12 17.464 12 17 12m0 0c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 1.288.408M13 8h.01M17 8h.01M21 16l-2.5 2.5m0 0L16 21m2.5-2.5L21 21m-2.5-2.5L16 16" fill="none"/>
    </svg>
  );
}
