import React from 'react';

/**
 * PiFileQuestionMarkDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFileQuestionMarkDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileQuestionMarkDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-question-mark icon',
  ...props
}: PiFileQuestionMarkDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M13 3.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C17.29 9 17.954 9 18.758 9h2.24q.003.251.002.537v6.106c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 23 14.727 23 13.643 23h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C3 17.6 3 16.727 3 15.643V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 5.73 1.544c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1h2.106l.537.001z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M15 1.282V3.2c0 .856 0 1.439.037 1.889.036.438.101.662.18.819a2 2 0 0 0 .875.874c.156.08.38.144.819.18C17.36 7 17.943 7 18.8 7h1.917a5 5 0 0 0-.454-.956c-.31-.506-.736-.931-1.35-1.545L17.5 3.085c-.614-.614-1.039-1.038-1.545-1.348A5 5 0 0 0 15 1.282Z"/><path fill={color || "currentColor"} d="M11.338 11.672a1.248 1.248 0 0 1 1.881 1.078v.001c0 .219-.177.52-.679.855a4.3 4.3 0 0 1-.887.446 1 1 0 0 0 .634 1.896q.225-.077.441-.175c.245-.109.58-.275.922-.503.622-.415 1.569-1.238 1.57-2.518a3.248 3.248 0 0 0-6.313-1.082 1 1 0 1 0 1.886.664c.098-.278.291-.513.545-.662Z"/><path fill={color || "currentColor"} d="M12 17a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2z"/>
    </svg>
  );
}
