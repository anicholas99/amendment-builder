import React from 'react';

/**
 * PiFile02SettingsDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02SettingsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02SettingsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-settings icon',
  ...props
}: PiFile02SettingsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M3 6a5 5 0 0 1 5-5h1.2c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819C13 3.361 13 3.943 13 4.8v.039c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h.039c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819.027.331.035.734.037 1.265l-.14-.004-.443-.005-.317-.31a3 3 0 0 0-4.198 0l-.317.31-.444.005a3 3 0 0 0-2.968 2.968l-.005.444-.31.317a3 3 0 0 0 0 4.198l.31.317.005.444c.008.842.364 1.6.93 2.14H8a5 5 0 0 1-5-5z"/><path fill={color || "currentColor"} d="m18.087 18-.026.061-.061.026-.061-.026-.026-.061.026-.061.061-.026.061.026z"/></g><path fill={color || "currentColor"} d="M14.956 2.748c-.04-.48-.117-.926-.292-1.348A9.02 9.02 0 0 1 20.6 7.336c-.422-.176-.868-.253-1.347-.292C18.71 7 18.046 7 17.242 7H17.2c-.576 0-.949-.001-1.232-.024-.272-.023-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422A17 17 0 0 1 15 4.8v-.042c0-.805 0-1.47-.044-2.01Z"/><path fill={color || "currentColor"} d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M18.7 13.285a1 1 0 0 0-1.4 0l-.891.873-1.248.013a1 1 0 0 0-.99.99l-.012 1.247-.873.892a1 1 0 0 0 0 1.4l.873.89.013 1.248a1 1 0 0 0 .99.99l1.247.013.891.873a1 1 0 0 0 1.4 0l.891-.873 1.248-.013a1 1 0 0 0 .99-.99l.012-1.247.873-.892a1 1 0 0 0 0-1.4l-.873-.89-.013-1.248a1 1 0 0 0-.99-.99l-1.247-.013zm-1.179 2.583L18 15.4l.479.47a1 1 0 0 0 .69.285l.67.007.007.67a1 1 0 0 0 .285.69l.47.479-.47.478a1 1 0 0 0-.285.69l-.007.67-.67.007a1 1 0 0 0-.69.286L18 20.6l-.479-.47a1 1 0 0 0-.69-.285l-.67-.007-.007-.67a1 1 0 0 0-.285-.69l-.47-.479.47-.478a1 1 0 0 0 .285-.69l.007-.67.67-.007a1 1 0 0 0 .69-.286Z" clipRule="evenodd"/>
    </svg>
  );
}
