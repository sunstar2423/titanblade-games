Sentry.init({
    dsn: "https://5752f76100bc0ed5d17444652339d50f@o4509524111523840.ingest.us.sentry.io/4509524122075136",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
    environment: "production",
    release: "isle-of-adventure@1.0.0",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
});

Sentry.setTag("game", "isle-of-adventure");
Sentry.setContext("game_info", {
    version: "web-1.0.0",
    platform: "browser",
    engine: "phaser3",
    genre: "point-and-click-adventure"
});

window.trackGameEvent = function (eventName, data) {
    if (typeof Sentry !== 'undefined') {
        Sentry.addBreadcrumb({
            message: eventName,
            category: 'game_event',
            data: data || {},
            level: 'info'
        });
    }
};
