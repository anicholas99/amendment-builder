import React from 'react';

/**
 * PiMetamaskDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiMetamaskDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMetamaskDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'metamask icon',
  ...props
}: PiMetamaskDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.738 3.522a1.5 1.5 0 0 1 .739.848c.21.609.58 1.29.413 1.95l.002-.001-1.142 4.53a4 4 0 0 0 .085 2.246l.857 2.563a1.5 1.5 0 0 1 .013.912l-.718 2.365a1.5 1.5 0 0 1-1.822 1.013l-2.364-.631a1.5 1.5 0 0 0-1.257.227l-1.655 1.178a1.5 1.5 0 0 1-.87.278h-2.043a1.5 1.5 0 0 1-.872-.28l-1.645-1.174a1.5 1.5 0 0 0-1.26-.23l-2.36.632a1.5 1.5 0 0 1-1.822-1.016l-.714-2.366a1.5 1.5 0 0 1 .012-.905l.85-2.573a4 4 0 0 0 .083-2.23l-1.14-4.542c-.162-.65.198-1.322.404-1.924A1.5 1.5 0 0 1 4.39 3.45l4.599 1.478a1.5 1.5 0 0 0 .46.072h4.826a1.5 1.5 0 0 0 .44-.066l4.903-1.508a1.5 1.5 0 0 1 1.12.096Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 12c0 .545-.455 1-1 1s-1-.455-1-1 .455-1 1-1 1 .455 1 1Zm7 0c0 .545-.455 1-1 1s-1-.455-1-1 .455-1 1-1 1 .455 1 1Z" fill="none"/>
    </svg>
  );
}
