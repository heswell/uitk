import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ClosedcaptionDisabledIconProps = IconProps;

export const ClosedcaptionDisabledIcon = forwardRef<
  SVGSVGElement,
  ClosedcaptionDisabledIconProps
>(function ClosedcaptionDisabledIcon(
  props: ClosedcaptionDisabledIconProps,
  ref
) {
  return (
    <Icon
      data-testid="ClosedcaptionDisabledIcon"
      aria-label="closedcaption disabled"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M3 3.707 3.707 3l5.657 5.657-.707.707L3 3.707ZM0 2.121V11h8.879l-1-1H1V3.121l-1-1Zm11 6.758V2H4.121l-1-1H12v8.879l-1-1Z" />
      <path d="M1.707 1 1 1.707 3.473 4.18a1.519 1.519 0 0 0-.733.69c-.16.298-.24.682-.24 1.15 0 .452.073.823.22 1.116.145.293.354.51.625.651.27.142.59.213.96.213.248 0 .456-.02.626-.063.17-.04.329-.1.477-.184v-.711c-.15.081-.31.147-.48.198-.17.052-.362.077-.576.077a.976.976 0 0 1-.548-.146.91.91 0 0 1-.336-.44 2 2 0 0 1-.113-.717c0-.293.037-.538.11-.735a.9.9 0 0 1 .339-.446.859.859 0 0 1 .22-.102L10.293 11l.707-.707L8.687 7.98a1.972 1.972 0 0 0 .721-.227v-.711c-.15.081-.31.147-.48.198-.17.052-.362.077-.576.077a1.08 1.08 0 0 1-.396-.068l-.467-.467a2 2 0 0 1-.134-.768c0-.293.037-.538.11-.735a.9.9 0 0 1 .339-.446c.153-.1.344-.15.572-.15.14 0 .284.02.435.06.15.039.298.087.442.145l.247-.655a2.246 2.246 0 0 0-.484-.163c-.189-.047-.4-.07-.633-.07-.367 0-.693.07-.978.213a1.519 1.519 0 0 0-.665.658c-.134.25-.212.559-.234.928l-1.16-1.16.154-.406a2.246 2.246 0 0 0-.484-.163 2.3 2.3 0 0 0-.29-.052L1.707 1Z" />
    </Icon>
  );
});
