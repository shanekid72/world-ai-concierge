import * as React from "react";

export const Alert = ({ className, children, ...props }: any) => (
  <div className={`p-3 rounded-md border ${className}`} {...props}>
    {children}
  </div>
);

export const AlertDescription = ({ children, ...props }: any) => (
  <p {...props}>{children}</p>
);
