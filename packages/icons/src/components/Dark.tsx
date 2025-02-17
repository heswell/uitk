import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DarkIconProps = IconProps;

export const DarkIcon = forwardRef<SVGSVGElement, DarkIconProps>(
  function DarkIcon(props: DarkIconProps, ref) {
    return (
      <Icon
        data-testid="DarkIcon"
        aria-label="dark"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M9.003 9.998a5 5 0 1 1-5.678-8.224 7.002 7.002 0 0 0 5.678 8.224Zm.925-.904A6 6 0 0 1 5.014.08 6.002 6.002 0 0 0 6 12a5.99 5.99 0 0 0 5.186-2.982 6.044 6.044 0 0 1-1.258.075Z"
          clipRule="evenodd"
        />
        <path d="M6.387 2.899H7.45V3.91H6.387V2.9ZM9.58.876h1.065v1.011H9.58V.876Zm0 4.046h1.065v1.011H9.58V4.922Z" />
      </Icon>
    );
  }
);
