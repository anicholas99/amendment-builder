import React from 'react';

/**
 * PiWhatsappDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiWhatsappDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWhatsappDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'whatsapp icon',
  ...props
}: PiWhatsappDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2C6.477 2 2 6.477 2 12c0 1.23.222 2.409.63 3.5a16 16 0 0 1 .154.431.3.3 0 0 1-.006.137 10 10 0 0 1-.064.281l-.357 1.532c-.123.523-.23.982-.282 1.357-.053.385-.075.833.1 1.274a2.35 2.35 0 0 0 1.313 1.312c.44.176.89.154 1.274.1.375-.051.834-.158 1.358-.28l1.53-.358a10 10 0 0 1 .344-.075.3.3 0 0 1 .074.005c.006.001.03.008.083.026.08.027.185.067.35.128 1.09.408 2.27.63 3.499.63 5.523 0 10-4.477 10-10S17.523 2 12 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M10.295 12.38a5 5 0 0 1-.377.309q.558.743 1.29 1.313l.012-.014c.197-.228.345-.398.503-.542a3.62 3.62 0 0 1 3.24-.85c.21.049.422.125.707.227l.08.028c.133.048.265.095.386.155.683.339 1.148 1 1.238 1.756.032.275.041.612-.011.934-.08.486-.35.893-.668 1.177a2.04 2.04 0 0 1-1.246.525 2 2 0 0 1-.395-.02l-.016-.002c-1.549-.182-2.952-.662-4.155-1.409a8.8 8.8 0 0 1-2.954-3.023C7.24 11.78 6.798 10.436 6.624 8.96l-.002-.015a2 2 0 0 1-.02-.395c.022-.491.242-.928.525-1.247a2.04 2.04 0 0 1 1.176-.667c.306-.05.637-.04.872-.018A2.26 2.26 0 0 1 11.02 7.92q.064.142.115.296l.022.062c.08.224.14.391.182.554a3.62 3.62 0 0 1-1.045 3.55Z"/>
    </svg>
  );
}
