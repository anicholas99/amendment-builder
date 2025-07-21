import React from 'react';

/**
 * PiEnvelopeSettingsDuoSolid icon from the duo-solid style in communication category.
 */
interface PiEnvelopeSettingsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopeSettingsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-settings icon',
  ...props
}: PiEnvelopeSettingsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M22.34 8.605a.392.392 0 0 1 .608.3C23 9.73 23 10.702 23 11.872v.172l-.001 1.056a3 3 0 0 0-2.14-.928l-.443-.005-.317-.31a3 3 0 0 0-1.59-.814z"/><path fill={color || "currentColor"} d="M12.384 14.061a6 6 0 0 1-1.732-.141c-1.007-.232-1.922-.815-3.324-1.708L1.66 8.605a.392.392 0 0 0-.608.3C1 9.73 1 10.702 1 11.872v.172c0 1.363 0 2.447.071 3.322.074.895.227 1.659.583 2.358a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583C7.509 21 8.593 21 9.956 21h2.22l-.004-.14-.005-.444-.31-.317a3 3 0 0 1 0-4.198l.31-.317.005-.444a3 3 0 0 1 .212-1.079Z"/><path fill={color || "currentColor"} d="m18.087 18-.026.061-.061.026-.061-.026-.026-.061.026-.061.061-.026.061.026z"/></g><path fill={color || "currentColor"} d="M9.956 3h4.087c1.364 0 2.448 0 3.322.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.379 2.19.47.47 0 0 1-.16.643l-6.185 3.936c-1.62 1.03-2.23 1.403-2.86 1.548a4 4 0 0 1-1.797 0c-.63-.145-1.24-.517-2.86-1.548L2.058 6.488a.47.47 0 0 1-.16-.644 6 6 0 0 1 2.379-2.19c.699-.356 1.463-.51 2.358-.583C7.51 3 8.593 3 9.956 3Z"/><path fill={color || "currentColor"} d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M18.7 13.286a1 1 0 0 0-1.4 0l-.891.873-1.248.013a1 1 0 0 0-.99.99l-.012 1.247-.873.891a1 1 0 0 0 0 1.4l.873.891.013 1.248a1 1 0 0 0 .99.99l1.247.012.891.873a1 1 0 0 0 1.4 0l.891-.873 1.248-.013a1 1 0 0 0 .99-.99l.012-1.247.873-.891a1 1 0 0 0 0-1.4l-.873-.891-.013-1.248a1 1 0 0 0-.99-.99l-1.247-.012zm-1.179 2.583.479-.47.479.47a1 1 0 0 0 .69.285l.67.007.007.67a1 1 0 0 0 .285.69l.47.479-.47.479a1 1 0 0 0-.285.69l-.007.67-.67.007a1 1 0 0 0-.69.285l-.479.47-.479-.47a1 1 0 0 0-.69-.285l-.67-.007-.007-.67a1 1 0 0 0-.285-.69l-.47-.479.47-.479a1 1 0 0 0 .285-.69l.007-.67.67-.007a1 1 0 0 0 .69-.285Z" clipRule="evenodd"/>
    </svg>
  );
}
