import React from 'react';

/**
 * PiPhotoImageSettingsDuoSolid icon from the duo-solid style in media category.
 */
interface PiPhotoImageSettingsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImageSettingsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-settings icon',
  ...props
}: PiPhotoImageSettingsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M9.956 2h4.088c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.605 1.187.645 2.634.653 4.72L23 11v2.102a3 3 0 0 0-2.14-.93l-.444-.005-.317-.31a3 3 0 0 0-4.198 0l-.317.31-.444.005a3 3 0 0 0-2.968 2.968l-.005.444-.31.317a3 3 0 0 0 0 4.198l.31.317.005.444c.004.404.088.79.237 1.14H9.993c-.75 0-1.412 0-1.995-.01-1.544-.03-2.714-.13-3.722-.644a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 15.491 1 14.407 1 13.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C7.509 2 8.593 2 9.956 2Z"/><path fill={color || "currentColor"} d="m18.087 18-.026.061-.061.026-.061-.026-.026-.061.026-.061.061-.026.061.026z"/></g><path fill={color || "currentColor"} d="M20.993 9.25h-.054c-1.335 0-2.067 0-2.692.064A12.25 12.25 0 0 0 7.346 19.97c.694.029 1.548.03 2.654.03h1.764a3 3 0 0 1 .093-4.1l.31-.316.005-.444a3 3 0 0 1 2.968-2.968l.444-.005.317-.31a3 3 0 0 1 4.198 0l.317.31.444.005q.07 0 .14.004V11c0-.669 0-1.245-.007-1.75Z"/><path fill={color || "currentColor"} d="M7.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill={color || "currentColor"} d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M18.7 13.286a1 1 0 0 0-1.4 0l-.891.873-1.248.013a1 1 0 0 0-.99.99l-.012 1.247-.873.891a1 1 0 0 0 0 1.4l.873.891.013 1.248a1 1 0 0 0 .99.99l1.247.012.891.873a1 1 0 0 0 1.4 0l.891-.873 1.248-.013a1 1 0 0 0 .99-.99l.012-1.247.873-.891a1 1 0 0 0 0-1.4l-.873-.891-.013-1.248a1 1 0 0 0-.99-.99l-1.247-.012zm-1.179 2.583.479-.47.479.47a1 1 0 0 0 .69.285l.67.007.007.67a1 1 0 0 0 .285.69l.47.479-.47.479a1 1 0 0 0-.285.69l-.007.67-.67.007a1 1 0 0 0-.69.285l-.479.47-.479-.47a1 1 0 0 0-.69-.285l-.67-.007-.007-.67a1 1 0 0 0-.285-.69l-.47-.479.47-.479a1 1 0 0 0 .285-.69l.007-.67.67-.007a1 1 0 0 0 .69-.285Z" clipRule="evenodd"/>
    </svg>
  );
}
