"use strict";
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.type = "text/javascript";
(document.head || document.documentElement).appendChild(script);
script.onload = () => {
    console.log("inject.js loaded");
};
window.addEventListener("message", (event) => {
    if (event.source !== window)
        return;
});
