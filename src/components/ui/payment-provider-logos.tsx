import * as React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Official Stripe Wordmark SVG
 * Sourced from Stripe Brand Guidelines / Press Assets
 * https://stripe.com/newsroom/brand-assets
 */
export function StripeLogo({ className = "h-5 w-auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 512 213"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Stripe"
      role="img"
      {...props}
    >
      <path
        fill="#635BFF"
        d="M512 110.08c0-36.409-17.636-65.138-51.342-65.138c-33.85 0-54.33 28.73-54.33 64.854c0 42.808 24.179 64.426 58.88 64.426c16.925 0 29.725-3.84 39.396-9.244v-28.445c-9.67 4.836-20.764 7.823-34.844 7.823c-13.796 0-26.027-4.836-27.591-21.618h69.547c0-1.85.284-9.245.284-12.658m-70.258-13.511c0-16.071 9.814-22.756 18.774-22.756c8.675 0 17.92 6.685 17.92 22.756zm-90.31-51.627c-13.939 0-22.899 6.542-27.876 11.094l-1.85-8.818h-31.288v165.83l35.555-7.537l.143-40.249c5.12 3.698 12.657 8.96 25.173 8.96c25.458 0 48.64-20.48 48.64-65.564c-.142-41.245-23.609-63.716-48.498-63.716m-8.534 97.991c-8.391 0-13.37-2.986-16.782-6.684l-.143-52.765c3.698-4.124 8.818-6.968 16.925-6.968c12.942 0 21.902 14.506 21.902 33.137c0 19.058-8.818 33.28-21.902 33.28M241.493 36.551l35.698-7.68V0l-35.698 7.538zm0 10.809h35.698v124.444h-35.698zm-38.257 10.524L200.96 47.36h-30.72v124.444h35.556V87.467c8.39-10.951 22.613-8.96 27.022-7.396V47.36c-4.551-1.707-21.191-4.836-29.582 10.524m-71.112-41.386l-34.702 7.395l-.142 113.92c0 21.05 15.787 36.551 36.836 36.551c11.662 0 20.195-2.133 24.888-4.693V140.8c-4.55 1.849-27.022 8.391-27.022-12.658V77.653h27.022V47.36h-27.022zM35.982 83.484c0-5.546 4.551-7.68 12.09-7.68c10.808 0 24.461 3.272 35.27 9.103V51.484c-11.804-4.693-23.466-6.542-35.27-6.542C19.2 44.942 0 60.018 0 85.192c0 39.252 54.044 32.995 54.044 49.92c0 6.541-5.688 8.675-13.653 8.675c-11.804 0-26.88-4.836-38.827-11.378v33.849c13.227 5.689 26.596 8.106 38.827 8.106c29.582 0 49.92-14.648 49.92-40.106c-.142-42.382-54.329-34.845-54.329-50.774"
      />
    </svg>
  );
}

/**
 * Official Visa Logo SVG
 * Sourced from Visa Brand Guidelines / Wikimedia Commons (Public Brand Assets)
 */
export function VisaLogo({ className = "h-4 w-auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 36 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Visa"
      role="img"
      {...props}
    >
      <path
        d="M14.54 0.28L9.52 11.72H6.24L3.81 2.51C3.66 1.94 3.53 1.73 3.09 1.48C2.36 1.08 1.11 0.7 0 0.44L0.07 0.28H5.45C6.14 0.28 6.76 0.74 6.91 1.54L8.23 8.53L11.51 0.28H14.54ZM27.35 7.94C27.37 4.91 23.15 4.74 23.18 3.39C23.19 2.98 23.59 2.54 24.47 2.42C24.91 2.36 26.11 2.31 27.42 2.92L27.95 0.47C27.23 0.21 26.29 0 25.1 0C22.04 0 19.89 1.63 19.87 3.96C19.84 5.68 21.41 6.64 22.58 7.21C23.78 7.8 24.18 8.18 24.18 8.71C24.16 9.52 23.19 9.87 22.3 9.89C20.73 9.91 19.82 9.47 19.09 9.12L18.54 11.69C19.34 12.06 20.81 12.38 22.34 12.4C25.59 12.4 27.33 10.79 27.35 7.94ZM35.43 11.72H38.08L35.75 0.28H33.31C32.76 0.28 32.29 0.6 32.09 1.09L27.41 11.72H30.64L31.28 9.93H35.23L35.43 11.72ZM32.17 7.56L33.52 3.86L34.3 7.56H32.17ZM19.26 0.28L16.73 11.72H13.63L16.16 0.28H19.26Z"
        fill="#1434CB"
      />
    </svg>
  );
}

/**
 * Official Mastercard Logo SVG
 * Sourced from Mastercard Brand Center
 * Interlocking red and amber circles
 */
export function MastercardLogo({ className = "h-4 w-auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mastercard"
      role="img"
      {...props}
    >
      <rect width="36" height="24" rx="3" fill="#F8FAFC" />
      <circle cx="14" cy="12" r="7" fill="#EB001B" />
      <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9" />
      <path
        d="M18 6.94A6.98 6.98 0 0 1 20.67 12 6.98 6.98 0 0 1 18 17.06 6.98 6.98 0 0 1 15.33 12 6.98 6.98 0 0 1 18 6.94Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

/**
 * Official American Express (Amex) Logo SVG
 * Sourced from American Express Brand Assets
 */
export function AmexLogo({ className = "h-4 w-auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="American Express"
      role="img"
      {...props}
    >
      <rect width="36" height="24" rx="3" fill="#006FCF" />
      <path
        d="M8.2 14.8h1.6l.8-2h2.8l.8 2h1.7l-3.3-8H9.3l-3.3 8h2.2zm3.1-3.6l.8-2 .8 2h-1.6zm7.2 3.6h1.6V8.4l2.5 4.6h1.2l2.5-4.6v6.4h1.6V6.8h-2.1l-2.6 4.8-2.6-4.8h-2.1v8zm12.3-6.4h-3.4v1.8h3.2v1.5h-3.2v1.6h3.5v1.5h-5.1V6.8h5V8.4zm-22.6 0H5v1.8h3.2v1.5H5v1.6h3.2v1.5H3.4V6.8h4.8V8.4z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Official UnionPay Logo SVG
 * Sourced from UnionPay International Brand Assets
 * Red, Blue, Green tri-color card symbol
 */
export function UnionPayLogo({ className = "h-4 w-auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="UnionPay"
      role="img"
      {...props}
    >
      <rect width="36" height="24" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
      <g transform="translate(6, 4)">
        {/* Red block */}
        <path d="M0 0h7.5l-2.8 16H0V0z" fill="#D81E06" />
        {/* Blue block */}
        <path d="M6.5 0h8.2l-2.8 16H3.7L6.5 0z" fill="#003580" />
        {/* Green block */}
        <path d="M13.5 0h8.2l-2.8 16h-8.2l2.8-16z" fill="#008075" />
        {/* Chinese character '银联' abstract white text line representation */}
        <path
          d="M8.5 4.5h4.2m-4.2 3.5h4.2m-4.2 3.5h4.2"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Official PayPal Logo SVG (for muted Coming Soon state)
 * Sourced from PayPal Brand Central
 */
export function PayPalLogo({ className = "h-4 w-auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PayPal"
      role="img"
      {...props}
    >
      <path
        d="M23.1 9.4c-.4 2.8-2.3 5.3-5.2 5.3h-2.3l-.9 5.8h-3.6l2.3-14.7h6.2c2.5 0 3.9 1.4 3.5 3.6z"
        fill="#0079C1"
      />
      <path
        d="M20.2 12.8c-.4 2.8-2.3 5.3-5.2 5.3h-2.3l-.9 5.8H8.2l2.3-14.7h6.2c2.5 0 3.9 1.4 3.5 3.6z"
        fill="#00457C"
      />
      <path
        d="M17.3 14.7c-.4 2.8-2.3 5.3-5.2 5.3h-2.3l-.9 5.8h3.6l.9-5.8h2.3c2.9 0 4.8-2.5 5.2-5.3.3-1.8-.7-3.1-2.4-3.5-.4 1.5-.7 2.6-1.2 3.5z"
        fill="#0079C1"
      />
    </svg>
  );
}

