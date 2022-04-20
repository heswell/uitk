import { forwardRef, memo } from "react";
import { Text, TextProps } from "./Text";

export const P = memo(
  forwardRef<HTMLParagraphElement, Omit<TextProps, "elementType">>(function P(
    { children, ...rest },
    ref
  ) {
    return (
      <Text elementType="p" ref={ref} {...rest}>
        {children}
      </Text>
    );
  })
);
