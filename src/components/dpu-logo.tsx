import * as React from 'react';

export function DpuLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2L1 9l4 1.5V17a1 1 0 001 1h12a1 1 0 001-1v-6.5L23 9l-3.3-2.6L12 2zm0 2.24L17.6 8H6.4L12 4.24zM5 16V9.91l7 3.11 7-3.11V16H5z" />
    </svg>
  );
}
