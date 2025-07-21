import React from 'react';

/**
 * PiFileSettingsDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFileSettingsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileSettingsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-settings icon',
  ...props
}: PiFileSettingsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M13 3.241v-2.24L12.463 1h-2.106C9.273 1 8.4 1 7.691 1.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 3.544 3.73c-.302.592-.428 1.233-.487 1.961C3 6.4 3 7.273 3 8.357v7.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C8.4 23 9.273 23 10.357 23h2.745a3 3 0 0 1-.93-2.14l-.005-.444-.31-.317a3 3 0 0 1 0-4.198l.31-.317.005-.444a3 3 0 0 1 2.968-2.968l.444-.005.317-.31a3 3 0 0 1 4.198 0l.317.31.444.005q.07 0 .14.004V9.537L20.999 9h-2.24c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C13 4.71 13 4.046 13 3.242Z"/><path fill={color || "currentColor"} d="m18.087 18-.026.061-.061.026-.061-.026-.026-.061.026-.061.061-.026.061.026z"/></g><path fill={color || "currentColor"} d="M15 1.282V3.2c0 .856 0 1.439.038 1.889.035.438.1.662.18.819a2 2 0 0 0 .874.874c.156.08.38.144.819.18C17.361 7 17.943 7 18.8 7h1.918a5 5 0 0 0-.455-.956c-.31-.506-.735-.931-1.35-1.545L17.5 3.085c-.614-.614-1.038-1.038-1.544-1.348A5 5 0 0 0 15 1.282Z"/><path fill={color || "currentColor"} d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M18.7 13.285a1 1 0 0 0-1.4 0l-.891.873-1.248.013a1 1 0 0 0-.99.99l-.012 1.248-.873.891a1 1 0 0 0 0 1.4l.873.89.013 1.249a1 1 0 0 0 .99.99l1.247.012.891.873a1 1 0 0 0 1.4 0l.891-.873 1.248-.013a1 1 0 0 0 .99-.99l.012-1.247.873-.892a1 1 0 0 0 0-1.399l-.873-.891-.013-1.248a1 1 0 0 0-.99-.99l-1.247-.013zm-1.18 2.585.479-.47.479.47a1 1 0 0 0 .69.285l.67.007.007.67a1 1 0 0 0 .285.69l.47.479-.47.479a1 1 0 0 0-.285.689l-.007.67-.67.007a1 1 0 0 0-.69.286L18 20.6l-.479-.47a1 1 0 0 0-.69-.285l-.67-.007-.007-.67a1 1 0 0 0-.285-.69l-.47-.478.47-.48a1 1 0 0 0 .285-.689l.007-.67.67-.007a1 1 0 0 0 .69-.285Z" clipRule="evenodd"/>
    </svg>
  );
}
