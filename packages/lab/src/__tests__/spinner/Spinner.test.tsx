import { render } from "@testing-library/react";
import { AriaAnnouncerProvider } from "@heswell/uitk-core";

import { Spinner, SpinnerProps } from "../../spinner";

jest.mock("@heswell/uitk-core", () => ({
  ...jest.requireActual("@heswell/uitk-core"),
  useAriaAnnouncer: () => ({
    announce: jest.fn(),
  }),
}));

// All previous tests were snapshot tests. These tests are to check svg existence by class

const renderSpinner = (props?: SpinnerProps) =>
  render(
    <AriaAnnouncerProvider>
      <Spinner {...props}></Spinner>
    </AriaAnnouncerProvider>
  );

describe("GIVEN a Spinner", () => {
  it("THEN should show on the screen", () => {
    const { container } = renderSpinner();
    expect(
      container.querySelector(".uitkSvgSpinner-medium")
    ).toBeInTheDocument();
  });

  it("THEN should show a large spinner on the screen", () => {
    const { container } = renderSpinner({ size: "large" });
    expect(
      container.querySelector(".uitkSvgSpinner-large")
    ).toBeInTheDocument();
  });

  it("THEN should show a small spinner on the screen", () => {
    const { container } = renderSpinner({ size: "small" });
    expect(
      container.querySelector(".uitkSvgSpinner-small")
    ).toBeInTheDocument();
  });
});
