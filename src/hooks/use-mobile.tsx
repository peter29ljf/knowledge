import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with 'false'. On the client, useEffect will update it to the correct value.
  // This ensures the hook always returns a boolean and avoids an initial 'undefined' state propagation.
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // This function will only run on the client.
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Run the check on mount to set the correct initial client-side value.
    checkDevice();

    // Listen for resize events to update the value.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkDevice);

    // Cleanup listener on component unmount.
    return () => mql.removeEventListener("change", checkDevice);
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount.

  return isMobile;
}
