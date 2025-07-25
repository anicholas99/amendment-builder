import React from 'react';

/**
 * PiAppleWatchContrast icon from the contrast style in devices category.
 */
interface PiAppleWatchContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAppleWatchContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'apple-watch icon',
  ...props
}: PiAppleWatchContrastProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <g fill="currentColor" opacity=".28"><path d="M12 19c1.864 0 2.796 0 3.53-.304q.245-.101.47-.232l-.506 1.79c-.177.625-.265.938-.447 1.17a1.5 1.5 0 0 1-.613.464c-.273.112-.599.112-1.25.112h-2.369c-.65 0-.976 0-1.249-.112a1.5 1.5 0 0 1-.613-.463c-.181-.233-.27-.546-.447-1.172L8 18.464q.225.131.47.232C9.203 19 10.135 19 12 19Z" fill="none" stroke="currentColor"/><path d="M15.53 5.304C14.797 5 13.865 5 12 5s-2.796 0-3.53.304a4 4 0 0 0-.47.232l.506-1.79c.177-.625.266-.938.447-1.17a1.5 1.5 0 0 1 .613-.464C9.84 2 10.165 2 10.816 2h2.369c.65 0 .976 0 1.249.112a1.5 1.5 0 0 1 .613.463c.181.233.27.546.447 1.172L16 5.536a4 4 0 0 0-.47-.232Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 11v2c0 1.864 0 2.796-.305 3.53A4 4 0 0 1 16 18.465M18 11c0-1.864 0-2.796-.305-3.53A4 4 0 0 0 16 5.535M18 11h1v-1h-1m-2-4.464-.506-1.79c-.177-.625-.265-.938-.447-1.17a1.5 1.5 0 0 0-.613-.464C14.16 2 13.835 2 13.184 2h-2.369c-.65 0-.976 0-1.249.112a1.5 1.5 0 0 0-.613.463c-.181.233-.27.546-.447 1.172L8 5.536m8 0a4 4 0 0 0-.47-.232C14.797 5 13.865 5 12 5s-2.796 0-3.53.304a4 4 0 0 0-.47.232m0 0a4 4 0 0 0-1.696 1.933C6 8.204 6 9.136 6 11v2c0 1.864 0 2.796.304 3.53A4 4 0 0 0 8 18.465m0 0 .506 1.79c.177.625.266.938.447 1.17a1.5 1.5 0 0 0 .613.464c.273.112.599.112 1.25.112h2.369c.65 0 .976 0 1.249-.112a1.5 1.5 0 0 0 .613-.463c.181-.233.27-.546.447-1.172l.506-1.79m-8 0q.225.13.47.232C9.203 19 10.135 19 12 19s2.796 0 3.53-.305q.245-.1.47-.23" fill="none"/>
    </svg>
  );
}
