import React from 'react';

/**
 * PiFileBoltDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFileBoltDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileBoltDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-bolt icon',
  ...props
}: PiFileBoltDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M13 3.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C17.29 9 17.954 9 18.758 9h2.24q.003.251.002.537v6.106c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 23 14.727 23 13.643 23h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C3 17.6 3 16.727 3 15.643V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 5.73 1.544c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1h2.106l.537.001z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M15 1.282V3.2c0 .857 0 1.439.038 1.889.035.438.1.663.18.819a2 2 0 0 0 .874.874c.156.08.38.145.819.18C17.361 7 17.943 7 18.8 7h1.918a5 5 0 0 0-.455-.956c-.31-.506-.735-.931-1.35-1.545L17.5 3.085c-.614-.613-1.038-1.038-1.544-1.348A5 5 0 0 0 15 1.282Z"/><path fill={color || "currentColor"} d="M12.8 11.1a1 1 0 1 0-1.6-1.2l-1.824 2.433a10 10 0 0 0-.447.626c-.101.164-.307.512-.277.948.035.484.3.922.714 1.175.374.228.778.205.97.19.217-.017.486-.062.76-.108l1.607-.267L11.2 16.9a1 1 0 0 0 1.6 1.2l1.825-2.433c.167-.223.33-.44.446-.626.101-.164.307-.512.277-.948a1.5 1.5 0 0 0-.714-1.174c-.373-.229-.778-.206-.97-.19-.217.016-.486.06-.76.107l-1.606.267z"/>
    </svg>
  );
}
