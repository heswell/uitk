import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressTodoIconProps = IconProps;

export const ProgressTodoIcon = forwardRef<
  SVGSVGElement,
  ProgressTodoIconProps
>(function ProgressTodoIcon(props: ProgressTodoIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressTodoIcon"
      aria-label="progress todo"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="m11.683 4.071-.947.323a5.024 5.024 0 0 0-.977-1.692l.753-.659a6.028 6.028 0 0 1 1.17 2.028ZM8.654.618l-.441.898a5.033 5.033 0 0 0-1.887-.506l.066-.998a6.033 6.033 0 0 1 2.262.606Zm-4.583-.3.323.946a5.03 5.03 0 0 0-1.692.977l-.659-.753A6.03 6.03 0 0 1 4.071.318ZM.618 3.345l.898.441a5.033 5.033 0 0 0-.506 1.887l-.998-.066a6.033 6.033 0 0 1 .606-2.262Zm-.3 4.583a6.029 6.029 0 0 0 1.17 2.028l.753-.659a5.029 5.029 0 0 1-.977-1.692l-.947.323Zm3.028 3.453.441-.897c.59.29 1.232.461 1.887.505l-.066.998a6.033 6.033 0 0 1-2.262-.606Zm4.583.3-.323-.946a5.023 5.023 0 0 0 1.692-.977l.659.753a6.028 6.028 0 0 1-2.028 1.17Zm3.453-3.028-.897-.441c.29-.59.461-1.232.505-1.887l.998.066a6.033 6.033 0 0 1-.606 2.262Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
