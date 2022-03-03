import { useState } from "react";

// TODO: This was a quick hack and it needs to be implemented properly
export default function FloatOnHover({ className, style, trigger, children }) {
  const [isFloating, setIsFloating] = useState(false);
  // const floated = React.cloneElement(React.Children.only(children), {
  //   onMouseLeave: () => setIsFloating(false),
  // });
  return (
    <>
      <div style={style} onMouseEnter={() => setIsFloating(true)}>
        {trigger}
      </div>
      {isFloating ? (
        <div className={className} onMouseLeave={() => setIsFloating(false)}>
          {children}
        </div>
      ) : null}
    </>
  );
}
