/**
 * Runs in <head> before the page paints, so there's no flash of the wrong theme.
 * Order: ?theme=light|dark (handy for demos) → saved choice → dark (the brand default).
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search).get("theme"),t=q==="light"||q==="dark"?q:localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";d.classList.toggle("dark",t==="dark");d.style.colorScheme=t}catch(e){}})()`;
