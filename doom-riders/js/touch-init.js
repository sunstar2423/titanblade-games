document.addEventListener('DOMContentLoaded', function () {
    function enableTouchGestures() {
        ['body', '#game-container', 'canvas'].forEach(function (selector) {
            var el = document.querySelector(selector);
            if (el) {
                el.style.touchAction = 'auto';
                el.style.pointerEvents = 'auto';
                el.style.webkitTouchCallout = 'default';
                el.style.webkitUserSelect = 'auto';
            }
        });

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.tagName === 'CANVAS') {
                        node.style.touchAction = 'auto';
                        node.style.pointerEvents = 'auto';
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    enableTouchGestures();
    setTimeout(enableTouchGestures, 1000);
    setTimeout(enableTouchGestures, 3000);
});
