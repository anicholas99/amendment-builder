import React from 'react';

/**
 * PiArcBrowserDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiArcBrowserDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArcBrowserDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arc-browser icon',
  ...props
}: PiArcBrowserDuoStrokeProps): JSX.Element {
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
      <g opacity=".28"><path fill="none" d="M10.728 11.77a5.34 5.34 0 0 1-3.259-1.63 5 5 0 0 1-.502-.624c-.99-1.456-2.99-1.843-4.474-.915-1.51.943-1.962 2.916-.954 4.398a11.6 11.6 0 0 0 2.693 2.792 11.9 11.9 0 0 0 4.44 2.032c.875.2 1.787.305 2.724.305.862 0 1.703-.089 2.514-.259l-.97-1.857a10.3 10.3 0 0 1-3.824-.139 9.9 9.9 0 0 1-3.696-1.691 9.6 9.6 0 0 1-2.227-2.308c-.35-.515-.216-1.217.36-1.577.6-.375 1.392-.198 1.76.344q.316.463.7.87a7.35 7.35 0 0 0 4.658 2.265 8 8 0 0 0 1.116.024z"/><path fill="none" d="m13.243 12.267.005.01 2.073 3.973.004.009-2.077-3.982z"/><path fill="none" fillRule="evenodd" d="M19.646 14.883c1.636-1.546 2.81-3.554 3.287-5.813.37-1.752-.818-3.398-2.548-3.734-1.72-.334-3.457.725-3.825 2.462a5 5 0 0 1-.222.745zm-1.129-6.67c.127-.6.767-1.053 1.487-.913.708.137 1.096.77.973 1.356a9.15 9.15 0 0 1-2.301 4.369l-1.224-2.346a6.8 6.8 0 0 0 1.065-2.467Z" clipRule="evenodd"/></g><path fill="none" fillRule="evenodd" d="M14.297 4.633c-.574-1.1-1.742-1.759-2.979-1.73s-2.373.74-2.892 1.869l-1.93 4.195q.262.243.471.549.226.332.502.624a5.34 5.34 0 0 0 3.263 1.63l1.048 2.019 2.91 5.578c.817 1.564 2.764 2.16 4.342 1.404 1.6-.766 2.292-2.67 1.462-4.26zm-3.682 6.083-.441.959A5.35 5.35 0 0 1 7.95 10.59l2.293-4.982c.185-.403.613-.694 1.121-.706.509-.011.954.26 1.16.656l6.197 11.878c.283.542.073 1.232-.553 1.532-.648.31-1.407.042-1.704-.526l-4.054-7.77a1 1 0 0 0-1.795.044Z" clipRule="evenodd"/><path fill="none" d="m3.59 15.281-.586 1.273c-.75 1.63.039 3.496 1.671 4.186 1.612.681 3.53-.002 4.268-1.607l.532-1.155a12 12 0 0 1-1.978-.486l-.37.805c-.266.577-1.008.882-1.673.6-.645-.272-.888-.954-.634-1.507l.427-.927A12 12 0 0 1 3.59 15.28Z"/>
    </svg>
  );
}
