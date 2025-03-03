setInterval(() => {
    postMessage(navigator.onLine ? "online" : "offline");
}, 5000);
