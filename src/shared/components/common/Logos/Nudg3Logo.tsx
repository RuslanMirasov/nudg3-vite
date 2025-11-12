interface Nudg3LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function Nudg3Logo({ className, width = 40, height = 40 }: Nudg3LogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 1621 1621" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="1620.38" height="1620.38" rx="235" fill="black" />
      <path
        d="M408.037 619.621L806.806 270L1211.48 619.615C1214.73 622.423 1216.59 626.506 1216.59 630.801V898.368C1216.59 910.999 1201.78 917.812 1192.19 909.59L806.806 579.122L427.486 909.209C417.92 917.534 403 910.739 403 898.058V630.736C403 626.478 404.836 622.428 408.037 619.621Z"
        fill="#A958F2"
      />
      <path
        d="M408.037 1039.1L806.806 689.483L1211.48 1039.1C1214.73 1041.91 1216.59 1045.99 1216.59 1050.28V1317.85C1216.59 1330.48 1201.78 1337.29 1192.19 1329.07L806.806 998.605L427.486 1328.69C417.92 1337.02 403 1330.22 403 1317.54V1050.22C403 1045.96 404.836 1041.91 408.037 1039.1Z"
        fill="#DBADF8"
      />
    </svg>
  );
}
