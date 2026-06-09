(function () {
    const gaId = document.currentScript && document.currentScript.dataset.gaId;
    if (!gaId || gaId === 'G-XXXXXXXXX') return;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId, {
        page_title: 'Battle of the Druids',
        custom_map: { custom_parameter: 'game_events' }
    });

    window.trackGameEvent = function (action, category) {
        gtag('event', action, {
            event_category: category || 'Game',
            event_label: 'Battle of the Druids'
        });
    };
})();
