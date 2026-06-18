import React, { useState, useEffect, MouseEvent } from "react";

// Tiny, fast, elegant SPA router hook
export function useLocation() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, "", to);
    setPathname(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { pathname, navigate };
}

// Intercepting Link component for native SPA feel
export interface LinkProps {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  key?: string | number;
}

export function Link({ href, children, style, className, onClick, ...otherProps }: LinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    // Let browser handle external links and modifiers
    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    e.preventDefault();
    window.history.pushState(null, "", href);
    // Dispatch instant popstate or navigation event so our hook catches it
    const popStateEvent = new PopStateEvent("popstate");
    window.dispatchEvent(popStateEvent);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <a href={href} onClick={handleClick} style={style} className={className} {...otherProps}>
      {children}
    </a>
  );
}
