import React from 'react';

/**
 * PiPencilScaleCrossDuoSolid icon from the duo-solid style in editing category.
 */
interface PiPencilScaleCrossDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilScaleCrossDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-scale-cross icon',
  ...props
}: PiPencilScaleCrossDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M16.852 1.648a3 3 0 0 0-1.864 0c-.405.131-.736.36-1.04.619-.289.245-.613.568-.988.944l-.028.028-.045.044-.004.003-.055.055a1.1 1.1 0 0 0-.23.313 1 1 0 0 0 .19 1.15l6.395 6.424a1 1 0 0 0 1.416.002l.19-.19c.375-.375.7-.7.944-.988.259-.304.488-.634.62-1.04a3 3 0 0 0 0-1.864c-.132-.406-.361-.736-.62-1.04a18 18 0 0 0-.944-.989L18.88 3.211c-.376-.376-.7-.7-.989-.944-.304-.259-.634-.488-1.04-.62Z"/><path fill={color || "currentColor"} d="M4.86 12.728a1 1 0 0 0-1.415-.002l-.234.233c-.376.376-.7.7-.944.989-.259.304-.488.634-.62 1.04a3 3 0 0 0 0 1.864c.132.406.361.736.62 1.04.245.289.568.613.944.989l1.908 1.908c.376.375.7.7.988.944.305.259.635.488 1.04.62a3 3 0 0 0 1.865 0c.406-.132.736-.361 1.04-.62.289-.245.613-.569.989-.944l.027-.028.055-.054.002-.002c.02-.02.047-.045.07-.07a1.1 1.1 0 0 0 .198-.24 1 1 0 0 0-.137-1.243z"/></g><path fill={color || "currentColor"} d="M6.727 2.07c-.302-.071-.613-.07-.93-.07l-2.799.005A1 1 0 0 0 2 3.029l.068 2.75c.007.307.014.607.09.898a2.6 2.6 0 0 0 .308.722c.158.256.37.467.586.684l13.102 13.16a2.57 2.57 0 0 0 3.215.346 7.3 7.3 0 0 0 2.24-2.277 2.6 2.6 0 0 0-.32-3.16l-.073-.073L8.186 2.99c-.224-.225-.443-.446-.708-.609a2.6 2.6 0 0 0-.75-.311Z"/>
    </svg>
  );
}
