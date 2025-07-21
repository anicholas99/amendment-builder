import React from 'react';

/**
 * PiStarHalfFilledDuoSolid icon from the duo-solid style in general category.
 */
interface PiStarHalfFilledDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStarHalfFilledDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'star-half-filled icon',
  ...props
}: PiStarHalfFilledDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 20.126q.124 0 .246.028c.106.026.226.081.784.384l.04.021c.825.449 1.499.814 2.044 1.056.539.238 1.114.434 1.704.374a3.06 3.06 0 0 0 2.495-1.812c.239-.543.23-1.15.17-1.736-.061-.594-.2-1.347-.372-2.27l-.008-.045c-.116-.625-.131-.755-.122-.865.013-.165.065-.325.151-.467.057-.094.147-.19.608-.627l.032-.03c.681-.648 1.237-1.176 1.636-1.62.393-.438.757-.925.882-1.504a3.06 3.06 0 0 0-.953-2.933c-.442-.395-1.023-.575-1.598-.698-.583-.126-1.343-.226-2.275-.349l-.044-.006c-.63-.083-.759-.108-.86-.15a1.06 1.06 0 0 1-.397-.289c-.072-.083-.136-.198-.41-.771l-.019-.04C15.33 4.927 15 4.236 14.7 3.72c-.295-.509-.646-1.005-1.158-1.304A3.06 3.06 0 0 0 12 2z" opacity=".28"/><path fill={color || "currentColor"} d="M12 2a3.07 3.07 0 0 0-1.542.416c-.512.299-.862.795-1.158 1.304-.3.517-.63 1.208-1.034 2.056l-.02.04c-.273.574-.337.689-.408.772a1.1 1.1 0 0 1-.397.289c-.102.042-.231.067-.86.15l-.045.006c-.931.123-1.691.223-2.275.349-.575.123-1.156.303-1.598.698a3.06 3.06 0 0 0-.953 2.933c.126.579.49 1.066.882 1.504.399.444.955.972 1.636 1.619l.033.03c.46.438.55.534.607.628.086.142.138.302.152.467.009.11-.007.24-.123.865l-.008.044c-.171.923-.31 1.677-.372 2.27-.06.586-.068 1.194.17 1.736a3.06 3.06 0 0 0 2.495 1.813c.59.06 1.166-.136 1.704-.374.546-.242 1.22-.607 2.045-1.055l.04-.022c.557-.303.677-.358.784-.384q.121-.028.245-.028z"/>
    </svg>
  );
}
