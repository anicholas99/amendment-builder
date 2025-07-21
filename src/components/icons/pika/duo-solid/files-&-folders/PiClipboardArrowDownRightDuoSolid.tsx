import React from 'react';

/**
 * PiClipboardArrowDownRightDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiClipboardArrowDownRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClipboardArrowDownRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'clipboard-arrow-down-right icon',
  ...props
}: PiClipboardArrowDownRightDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} clipPath="url(#icon-zbfp7gsb1-a)"><path fill={color || "currentColor"} fillRule="evenodd" d="M9.907 1h4.186c.369 0 .731-.001 1.054.085a2.5 2.5 0 0 1 1.768 1.768q.036.138.054.284a4.4 4.4 0 0 1 1.301.408 5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.962.058.707.058 1.582.058 2.665v5.286c0 .72 0 1.347-.017 1.895a13 13 0 0 0-1.143-.95 3 3 0 0 0-4.196.628 3 3 0 0 0-.417.784H14a3 3 0 0 0-2.236 5h-1.407c-1.084 0-1.958 0-2.666-.058-.729-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C3 17.6 3 16.727 3 15.643v-5.286c0-1.083 0-1.958.058-2.665.06-.73.185-1.37.487-1.962A5 5 0 0 1 5.73 3.545a4.4 4.4 0 0 1 1.3-.408 2 2 0 0 1 .055-.284 2.5 2.5 0 0 1 1.768-1.768C9.176 1 9.538 1 9.907 1Zm-.408 2.006c-.107.004-.132.012-.128.011a.5.5 0 0 0-.354.354s-.007.028-.012.128C9 3.61 9 3.759 9 4v.039c0 .227 0 .366.006.471.005.1.012.124.011.12a.5.5 0 0 0 .354.353.6.6 0 0 0 .128.012C9.61 5 9.759 5 10 5h4c.242 0 .39 0 .501-.005.107-.005.132-.013.128-.012a.5.5 0 0 0 .354-.353c-.001.003.006-.02.011-.12.005-.105.006-.244.006-.471V4c0-.241 0-.39-.005-.501-.005-.107-.013-.132-.012-.128a.5.5 0 0 0-.354-.354c.004.001-.021-.007-.128-.011A12 12 0 0 0 14 3h-4c-.242 0-.39 0-.501.006Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M10 1h-.093c-.369 0-.731-.001-1.054.085a2.5 2.5 0 0 0-1.768 1.768C7 3.176 7 3.538 7 3.907v.186c0 .369-.001.731.085 1.054a2.5 2.5 0 0 0 1.768 1.768C9.176 7 9.538 7 9.907 7h4.186c.369 0 .73.001 1.054-.085a2.5 2.5 0 0 0 1.767-1.768c.087-.323.086-.685.086-1.054v-.186c0-.369 0-.731-.086-1.054a2.5 2.5 0 0 0-1.767-1.768C14.824 1 14.46 1 14.093 1H14zm-.63 2.017c-.003.001.022-.007.129-.012C9.61 3 9.759 3 10 3h4c.241 0 .39 0 .501.005a1 1 0 0 1 .128.012.5.5 0 0 1 .354.354c0 .003.007.034.011.128C15 3.61 15 3.759 15 4s0 .39-.006.501c-.005.107-.012.132-.011.128a.5.5 0 0 1-.354.354 1 1 0 0 1-.128.012C14.39 5 14.241 5 14 5h-4c-.241 0-.39 0-.501-.005-.107-.005-.132-.013-.128-.012a.5.5 0 0 1-.354-.354c.001.004-.007-.021-.012-.128C9 4.39 9 4.241 9 4s0-.39.005-.501c.005-.107.013-.132.012-.128a.5.5 0 0 1 .354-.354Z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M18.65 18.196a1 1 0 0 0-1.188 1.608q.13.096.255.196H14a1 1 0 1 0 0 2h3.717a9 9 0 0 1-.255.196 1 1 0 0 0 1.189 1.608 11 11 0 0 0 2.06-1.98A1.32 1.32 0 0 0 21 21c0-.292-.098-.584-.29-.823a11 11 0 0 0-2.06-1.981Z"/></g><defs><clipPath id="icon-zbfp7gsb1-a"><path fill={color || "currentColor"} d="M0 0h24v24H0z"/></clipPath></defs>
    </svg>
  );
}
