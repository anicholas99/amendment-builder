import React from 'react';

/**
 * PiServerSettingsContrast icon from the contrast style in development category.
 */
interface PiServerSettingsContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerSettingsContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'server-settings icon',
  ...props
}: PiServerSettingsContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M6.108 12.022C6.303 12 6.536 12 7 12c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 8.697 3 8.464 3 8s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086C6.303 4 6.536 4 7 4h10c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086C21 7.303 21 7.536 21 8s0 .697-.022.892a3.5 3.5 0 0 1-1.5 2.496 3 3 0 0 0-3.577.469l-.317.31-.444.005a3 3 0 0 0-2.968 2.968l-.005.444-.31.317a3 3 0 0 0-.455 3.601V20H7c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 16.697 3 16.464 3 16s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12h5.734M7 12c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086C3 15.303 3 15.536 3 16s0 .697.022.892a3.5 3.5 0 0 0 3.086 3.086C6.303 20 6.536 20 7 20h3.527M7 12c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 8.697 3 8.464 3 8s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086C6.303 4 6.536 4 7 4h10c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086C21 7.303 21 7.536 21 8s0 .697-.022.892a3.5 3.5 0 0 1-.759 1.812M13 8h.01M17 8h.01M18 18h.01M18 14l1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z" fill="none"/>
    </svg>
  );
}
