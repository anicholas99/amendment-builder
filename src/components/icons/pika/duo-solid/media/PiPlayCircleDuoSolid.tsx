import React from 'react';

/**
 * PiPlayCircleDuoSolid icon from the duo-solid style in media category.
 */
interface PiPlayCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlayCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'play-circle icon',
  ...props
}: PiPlayCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="m13.572 9.226.223.143c.497.32.913.587 1.224.83.318.248.615.535.78.925a2.25 2.25 0 0 1 0 1.752c-.165.39-.462.677-.78.925-.31.242-.727.51-1.224.83l-.223.143c-.575.37-1.051.676-1.445.88-.396.206-.825.376-1.287.343a2.25 2.25 0 0 1-1.641-.896c-.278-.372-.368-.824-.408-1.268-.041-.442-.041-1.008-.041-1.692v-.282c0-.684 0-1.25.04-1.692.041-.444.13-.897.409-1.268a2.25 2.25 0 0 1 1.64-.896c.463-.033.893.136 1.288.342.394.205.87.511 1.445.881Z" clipRule="evenodd"/>
    </svg>
  );
}
