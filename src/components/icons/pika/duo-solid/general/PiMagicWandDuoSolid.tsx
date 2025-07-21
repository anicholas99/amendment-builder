import React from 'react';

/**
 * PiMagicWandDuoSolid icon from the duo-solid style in general category.
 */
interface PiMagicWandDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMagicWandDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'magic-wand icon',
  ...props
}: PiMagicWandDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M15.5 17a1 1 0 0 1 .93.633c.134.338.24.494.338.593s.255.207.6.343l.136.067a1 1 0 0 1 0 1.728l-.137.067c-.344.136-.502.245-.6.343a1.3 1.3 0 0 0-.242.371l-.094.222a1 1 0 0 1-1.795.137l-.067-.137c-.133-.338-.238-.494-.337-.593a1.3 1.3 0 0 0-.374-.247l-.225-.096a1 1 0 0 1 0-1.862l.225-.096c.194-.093.301-.174.374-.247.099-.1.204-.255.337-.593l.067-.137A1 1 0 0 1 15.5 17Z"/><path fill={color || "currentColor"} d="M20.5 11a1 1 0 0 1 .93.633c.134.338.24.494.338.593s.255.207.6.343l.136.067a1 1 0 0 1-.137 1.795c-.344.136-.502.245-.6.343-.073.075-.151.18-.242.372l-.094.221a1 1 0 0 1-1.862 0c-.133-.338-.238-.494-.337-.593a1.3 1.3 0 0 0-.374-.247l-.225-.096a1 1 0 0 1 0-1.862l.225-.096c.194-.093.301-.174.374-.247.099-.1.204-.255.337-.593l.067-.137A1 1 0 0 1 20.5 11Z"/><path fill={color || "currentColor"} d="M7.476 1a1 1 0 0 1 .93.633l.176.41c.174.367.344.612.533.803.252.254.606.478 1.228.723l.136.067a1.001 1.001 0 0 1-.136 1.795c-.622.245-.976.47-1.228.723-.19.191-.359.436-.533.803l-.176.41a1.001 1.001 0 0 1-1.795.137l-.066-.137c-.24-.607-.457-.958-.71-1.213-.22-.222-.519-.422-1.006-.633l-.22-.09a1.001 1.001 0 0 1 0-1.862l.22-.09c.487-.211.786-.411 1.007-.633.252-.255.47-.606.709-1.213l.066-.137A1 1 0 0 1 7.476 1Z"/></g><path fill={color || "currentColor"} fillRule="evenodd" d="M16.734 3.127a2 2 0 0 1 2.829 0l1.06 1.061.137.152a2 2 0 0 1-.137 2.676L6.766 20.873a2 2 0 0 1-2.828 0l-1.06-1.06a2 2 0 0 1 0-2.829zM15.069 7.62l1.06 1.06 3.08-3.079-1.061-1.06z" clipRule="evenodd"/>
    </svg>
  );
}
