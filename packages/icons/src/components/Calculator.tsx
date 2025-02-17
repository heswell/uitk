import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CalculatorIconProps = IconProps;

export const CalculatorIcon = forwardRef<SVGSVGElement, CalculatorIconProps>(
  function CalculatorIcon(props: CalculatorIconProps, ref) {
    return (
      <Icon
        data-testid="CalculatorIcon"
        aria-label="calculator"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M11 1H1v10h10V1ZM0 0v12h12V0H0Z"
          clipRule="evenodd"
        />
        <path d="M8 2h1v4H8V2Z" />
        <path d="M9 2H8v1.5H6.5v1H8V6h1V4.5h1.5v-1H9V2ZM2.207 6.5l-.707.707 1.06 1.06L1.5 9.329l.707.708 1.06-1.061 1.061 1.06.708-.707-1.061-1.06 1.06-1.06-.707-.708-1.06 1.06-1.06-1.06Zm-.707-3h4v1h-4v-1Zm5 5.5h4v1h-4V9Zm0-2h4v1h-4V7Z" />
      </Icon>
    );
  }
);
