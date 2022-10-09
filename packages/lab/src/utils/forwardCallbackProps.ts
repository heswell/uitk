/* 
  When we clone a React element and inject props, if any of these are
  callback props, make sure original callback props are also invoked. 
  
 React.cloneElement(
    element,
    forwardCallbackProps(element.props, overrideProps)
  )
 */
export const forwardCallbackProps = (elementProps: any, overrideProps: any) => {
  const callbackProps = Object.entries<Function>(elementProps).filter(
    ([, value]) => typeof value === "function"
  );

  if (callbackProps.some(([name]) => overrideProps[name] !== undefined)) {
    const props = {
      ...overrideProps,
      ...callbackProps.reduce((map, [name, fn]) => {
        if (overrideProps[name] && typeof overrideProps[name] === "function") {
          map[name] = (...args: any) => {
            fn(...args);
            overrideProps[name]?.(...args);
          };
        } else {
          map[name] = fn;
        }
        return map;
      }, {} as any),
    };

    return props;
  } else {
    return overrideProps;
  }
};
