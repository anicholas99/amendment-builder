import React from 'react';

/**
 * PiShoppingCartDuoSolid icon from the duo-solid style in general category.
 */
interface PiShoppingCartDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShoppingCartDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'shopping-cart icon',
  ...props
}: PiShoppingCartDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M7 21a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/><path fill={color || "currentColor"} d="M16 21a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/></g><path fill={color || "currentColor"} d="M4.305 4.02C4.056 4 3.732 4 3.225 4H2a1 1 0 1 1 0-2h1.26c.462 0 .864 0 1.198.026.355.027.707.087 1.054.245A3 3 0 0 1 6.79 3.38c.207.321.316.662.393 1.01.072.326.13.724.194 1.181l.07.487 11.163.774a14 14 0 0 1 1.064.099c.319.049.656.133.975.33.462.284.818.711 1.016 1.216.137.35.159.697.15 1.02-.009.3-.049.661-.093 1.063l-.1.896c-.108.973-.195 1.761-.317 2.398-.125.657-.299 1.23-.62 1.754a5 5 0 0 1-2.144 1.92c-.556.26-1.145.37-1.812.422-.646.05-1.438.05-2.417.05H10.74c-.462 0-.864 0-1.198-.026-.354-.027-.707-.087-1.054-.245A3 3 0 0 1 7.21 16.62c-.207-.322-.316-.662-.393-1.01-.072-.327-.13-.725-.194-1.182L5.584 7.162l-.005-.04-.176-1.233a16 16 0 0 0-.173-1.067c-.051-.23-.094-.317-.123-.362a1 1 0 0 0-.426-.37c-.048-.022-.14-.052-.376-.07Z"/>
    </svg>
  );
}
