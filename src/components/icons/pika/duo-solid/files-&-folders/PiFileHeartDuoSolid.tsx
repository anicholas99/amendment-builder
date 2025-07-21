import React from 'react';

/**
 * PiFileHeartDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFileHeartDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileHeartDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-heart icon',
  ...props
}: PiFileHeartDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M13 3.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C17.29 9 17.954 9 18.758 9h2.24q.003.251.002.537v6.106c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 23 14.727 23 13.643 23h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C3 17.6 3 16.727 3 15.643V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 5.73 1.544c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1h2.106l.537.001z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M15 1.282V3.2c0 .856 0 1.439.038 1.889.035.438.1.662.18.819a2 2 0 0 0 .874.874c.156.08.38.144.819.18C17.361 7 17.943 7 18.8 7h1.918a5 5 0 0 0-.455-.956c-.31-.506-.735-.931-1.35-1.545L17.5 3.085c-.614-.614-1.038-1.038-1.544-1.348A5 5 0 0 0 15 1.282Z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M13.414 10.5a2.77 2.77 0 0 0-1.417.35 2.84 2.84 0 0 0-1.397-.35c-1.52 0-3.1 1.22-3.1 3.042 0 1.631 1.061 2.905 1.962 3.689.47.41.952.733 1.348.96.197.112.383.206.546.275a3 3 0 0 0 .252.095c.062.019.213.064.392.064.178 0 .33-.045.392-.064a3 3 0 0 0 .252-.095c.163-.07.35-.163.546-.276.396-.226.877-.55 1.348-.96.9-.783 1.962-2.057 1.962-3.688 0-1.833-1.59-3.02-3.086-3.042Zm-.59 2.246a.5.5 0 0 1 .217-.187.8.8 0 0 1 .345-.06c.604.01 1.114.494 1.114 1.043 0 .75-.514 1.518-1.275 2.18-.36.314-.732.564-1.026.731a5 5 0 0 1-.199.108 5 5 0 0 1-.199-.108 6.6 6.6 0 0 1-1.026-.731c-.761-.662-1.275-1.43-1.275-2.18 0-.56.52-1.042 1.1-1.042a.9.9 0 0 1 .36.064.5.5 0 0 1 .215.182 1 1 0 0 0 1.65 0Z" clipRule="evenodd"/>
    </svg>
  );
}
