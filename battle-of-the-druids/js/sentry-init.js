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
    release: "battle-of-the-druids@1.0.0",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
});

Sentry.setTag("game", "battle-of-the-druids");
Sentry.setContext("game_info", {
    version: "web-1.0.0",
    platform: "browser",
    engine: "phaser3"
});
