(function () {
    const gaId = document.currentScript && document.currentScript.dataset.gaId;
    if (!gaId || gaId === 'G-XXXXXXXXX') return;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId, {
        page_title: 'Isle of Adventure',
        custom_map: { custom_parameter: 'game_events' }
    });

    window.trackGameEvent = function (eventName, data) {
        gtag('event', eventName, {
            event_category: 'Game',
            event_label: 'Isle of Adventure',
            ...(data || {})
        });
    };
})();
