import React from 'react';

/**
 * PiScalePencilCrossDuoSolid icon from the duo-solid style in editing category.
 */
interface PiScalePencilCrossDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScalePencilCrossDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'scale-pencil-cross icon',
  ...props
}: PiScalePencilCrossDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="m3.052 8.083.048.048.35.355a1 1 0 0 0 1.419.004l3.698-3.698a1 1 0 0 0 .005-1.41l-.332-.336-.003-.004-.052-.051c-.223-.225-.442-.446-.707-.609a2.6 2.6 0 0 0-.75-.311c-.303-.073-.614-.072-.93-.071l-2.8.005A1 1 0 0 0 2 3.029l.068 2.75c.007.307.014.607.09.898a2.6 2.6 0 0 0 .308.722c.158.256.37.467.586.684Z"/><path fill={color || "currentColor"} d="M20.615 15.472a1 1 0 0 0-1.417-.003l-3.7 3.698a1 1 0 0 0-.002 1.411l.656.663.002.002a2.57 2.57 0 0 0 3.215.346 7.3 7.3 0 0 0 2.146-2.132q.048-.072.094-.145a2.6 2.6 0 0 0-.32-3.16c-.22-.231-.45-.454-.674-.68Z"/></g><path fill={color || "currentColor"} d="M12.373 5.234a1.016 1.016 0 1 0-1.436 1.437l2.84 2.84a1 1 0 1 1-1.415 1.414l-2.84-2.84a1.016 1.016 0 1 0-1.436 1.437l2.126 2.127a1 1 0 0 1-1.414 1.414l-2.127-2.126a1.016 1.016 0 1 0-1.437 1.436l2.84 2.84a1 1 0 1 1-1.414 1.414l-2.7-2.7c-.474-.474-1.26-.49-1.693.02-.259.305-.488.636-.62 1.041a3 3 0 0 0 0 1.864c.132.406.361.736.62 1.04.245.289.568.613.944.989l1.908 1.908c.376.375.7.7.988.944.305.259.635.488 1.04.62a3 3 0 0 0 1.865 0c.406-.132.736-.361 1.04-.62.289-.245.613-.569.988-.944l9.749-9.749c.375-.375.7-.7.944-.988.259-.304.488-.634.62-1.04a3 3 0 0 0 0-1.864c-.132-.406-.361-.736-.62-1.04-.245-.289-.569-.613-.944-.989L18.88 3.211c-.376-.376-.7-.7-.989-.944-.304-.259-.634-.488-1.04-.62a3 3 0 0 0-1.864 0c-.405.132-.736.361-1.04.62-.51.433-.495 1.219-.021 1.692l1.987 1.988A1 1 0 0 1 14.5 7.361z"/>
    </svg>
  );
}
