import React from 'react';

/**
 * PiDoorOpenContrast icon from the contrast style in building category.
 */
interface PiDoorOpenContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDoorOpenContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'door-open icon',
  ...props
}: PiDoorOpenContrastProps): JSX.Element {
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
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 20h9m8 0h3" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 20V7.98c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.092C6.9 3.98 7.6 3.98 9 3.98h2" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 20.713V3.308c0-.775 0-1.163.163-1.412a1 1 0 0 1 .619-.43c.29-.064.653.072 1.38.344l3.242 1.216c.936.351 1.404.527 1.749.83.305.269.54.608.684.987.163.43.163.93.163 1.929v10.512c0 1.008 0 1.513-.166 1.945a2.5 2.5 0 0 1-.693.99c-.35.305-.823.477-1.77.823l-3.223 1.174c-.723.264-1.084.396-1.373.33a1 1 0 0 1-.614-.43C11 21.865 11 21.481 11 20.712Z" fill="none"/><path fill="currentColor" d="M11 20.713V3.308c0-.775 0-1.163.163-1.412a1 1 0 0 1 .619-.43c.29-.064.653.072 1.38.344l3.242 1.216c.936.351 1.404.527 1.749.83.305.269.54.608.684.987.163.43.163.93.163 1.929v10.512c0 1.008 0 1.513-.166 1.945a2.5 2.5 0 0 1-.693.99c-.35.305-.823.477-1.77.823l-3.223 1.174c-.723.264-1.084.396-1.373.33a1 1 0 0 1-.614-.43C11 21.865 11 21.481 11 20.712Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.947 11.618h-.918" fill="none"/>
    </svg>
  );
}
