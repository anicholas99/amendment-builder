import React from 'react';

/**
 * PiFireDefaultDuoSolid icon from the duo-solid style in general category.
 */
interface PiFireDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFireDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'fire-default icon',
  ...props
}: PiFireDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12.935 1.183a1 1 0 0 0-1.335.968c.023.87-.48 2.116-1.316 3.194-.404.522-.85.955-1.278 1.249a2.8 2.8 0 0 1-.57.31L8.39 6.84a15 15 0 0 1-.82-1.307 1 1 0 0 0-1.663-.135C4.33 7.413 3 10.066 3 13c0 2.213.737 4.458 2.253 6.164C6.785 20.888 9.062 22 12 22s5.215-1.112 6.747-2.836C20.263 17.458 21 15.213 21 13c0-3.032-1.42-5.765-3.068-7.805-1.632-2.019-3.623-3.524-4.997-4.012Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M13.613 11.58a1 1 0 0 0-.845 0c-.707.33-2.1 1.092-3.148 2.14-.525.525-1.025 1.182-1.265 1.954-.253.813-.197 1.7.313 2.56.618 1.044 1.716 1.59 2.788 1.729s2.26-.108 3.171-.827c1.6-1.264 1.731-3.051 1.32-4.467a5.9 5.9 0 0 0-.935-1.869c-.38-.506-.864-.97-1.4-1.22Z" clipRule="evenodd"/>
    </svg>
  );
}
