(function () {
    var gaId = document.currentScript && document.currentScript.dataset.gaId;
    if (!gaId || gaId === 'G-XXXXXXXXX') return;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId, { page_title: 'TitanBlade Games - Main Site' });
})();
