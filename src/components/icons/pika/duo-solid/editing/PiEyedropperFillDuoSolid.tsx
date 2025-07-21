import React from 'react';

/**
 * PiEyedropperFillDuoSolid icon from the duo-solid style in editing category.
 */
interface PiEyedropperFillDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEyedropperFillDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'eyedropper-fill icon',
  ...props
}: PiEyedropperFillDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10.375 7.038a1 1 0 0 1 1.277.004 35.3 35.3 0 0 1 4.374 4.36 1 1 0 0 1-.06 1.35l-1.953 1.955L9.49 19.23c-.29.29-.542.55-.83.747l-.125.082a3 3 0 0 1-1.217.409l-.184.014c-.379.018-.757-.06-1.189-.146l-1.412.47c-.225.076-.46.155-.657.202a1.6 1.6 0 0 1-.755.018l-.136-.04a1.5 1.5 0 0 1-.843-.754l-.065-.155c-.13-.366-.064-.707-.021-.89.046-.197.125-.431.2-.657l.472-1.413c-.087-.431-.165-.809-.147-1.187l.014-.186a3 3 0 0 1 .41-1.216l.081-.126c.198-.287.457-.54.747-.829l6.47-6.47zM7.235 13h5.657l1.002-1.003a33 33 0 0 0-2.833-2.824z" opacity=".28"/><path fill={color || "currentColor"} d="M14.455 3.03a4 4 0 0 1 5.65 5.649l-.143.149-.707.707.117.117.196.216a2.836 2.836 0 0 1 0 3.578l-.196.215-1.274 1.274c-.536.536-1.402.5-1.896-.048l-.092-.117a33 33 0 0 0-1.197-1.573l-.419-.508a33 33 0 0 0-3.57-3.638l-.555-.475q-.73-.61-1.493-1.178l-.513-.373a1.308 1.308 0 0 1-.165-1.989l1.275-1.274.216-.195a2.834 2.834 0 0 1 3.793.195l.117.117.707-.707z"/>
    </svg>
  );
}
