import React from 'react';

/**
 * PiAppleNewSiriSolid icon from the solid style in ai category.
 */
interface PiAppleNewSiriSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAppleNewSiriSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'apple-new-siri icon',
  ...props
}: PiAppleNewSiriSolidProps): JSX.Element {
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
      <path fillRule="evenodd" d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85c5.605 0 10.15 4.544 10.15 10.15S17.605 22.15 12 22.15 1.85 17.606 1.85 12Zm2.075 0a3.514 3.514 0 0 1 3.514-3.514c.494 0 1.113.196 1.823.583.696.38 1.399.899 2.038 1.438a22 22 0 0 1 1.582 1.483c.357.37.689.762 1.046 1.13a14 14 0 0 0 1.07 1.003c.432.365.946.75 1.494 1.049.534.29 1.183.546 1.864.546a3.718 3.718 0 0 0 0-7.436c-.486 0-.951.13-1.36.302a1 1 0 0 0 .777 1.843c.253-.106.447-.145.583-.145a1.718 1.718 0 0 1 0 3.436c-.202 0-.506-.084-.907-.302a7.3 7.3 0 0 1-1.161-.82c-.37-.313-.693-.628-.924-.867-.481-.497-.17-.184-.543-.594a24 24 0 0 0-2.231-2.156c-.698-.59-1.515-1.199-2.37-1.666-.844-.46-1.809-.827-2.78-.827a5.514 5.514 0 1 0 0 11.028c.831 0 1.653-.269 2.39-.627.745-.361 1.464-.843 2.108-1.338a1 1 0 0 0-1.221-1.585c-.577.445-1.178.842-1.76 1.124-.59.286-1.102.426-1.518.426A3.514 3.514 0 0 1 3.925 12Z" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
