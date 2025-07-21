import React from 'react';

/**
 * PiGraduationHatDuoSolid icon from the duo-solid style in general category.
 */
interface PiGraduationHatDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraduationHatDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'graduation-hat icon',
  ...props
}: PiGraduationHatDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M4.44 12.92a.3.3 0 0 0-.44.265v2.967c-.001.32-.002.644.098.952a2 2 0 0 0 .42.722c.218.24.5.402.78.56l.012.007.799.456c1.87 1.07 3.01 1.721 4.241 1.98 1.088.23 2.212.23 3.3 0 1.23-.259 2.37-.91 4.241-1.98l.799-.456.014-.008c.278-.158.56-.319.778-.559a2 2 0 0 0 .419-.722c.1-.308.1-.632.099-.953v-2.966a.3.3 0 0 0-.441-.265l-3.068 1.635c-.96.51-1.976 1.087-3.112 1.31a7.2 7.2 0 0 1-2.758 0c-1.137-.223-2.153-.8-3.113-1.31z" opacity=".28"/><path fill={color || "currentColor"} d="M1.175 7.118A1.6 1.6 0 0 0 1 7.847V15a1 1 0 1 0 2 0V9.887l5.579 2.972c.998.532 1.684.898 2.428 1.044.655.13 1.33.13 1.986 0 .744-.146 1.43-.512 2.428-1.044l6.08-3.24c.509-.27 1.092-.542 1.348-1.093.21-.45.2-.967-.024-1.408-.274-.542-.865-.795-1.381-1.05L15.224 3c-.945-.466-1.594-.787-2.293-.915a5.2 5.2 0 0 0-1.862 0c-.699.128-1.348.449-2.292.915l-6.22 3.068c-.517.255-1.108.508-1.382 1.05Z"/>
    </svg>
  );
}
