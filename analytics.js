//
const analyticsConfigs = [
    {
        funcName: 'ga',  // Google Universal Analytics
        domain: 'www.google-analytics.com',
        intercept: {
            eventType: (args) => (args[0] === 'send' && (args[1] === 'pageview' || args[1] === 'event')) ? args[1] : null,
            eventName: (args) => args[1] === 'pageview' ? location.href : (args[1] === 'event' ? args[2] : null),
            eventList: (args) => args
        }
    },
    {
        funcName: 'gtag',  // Google Analytics (GA4)
        domain: 'www.googletagmanager.com',

        intercept: {
            eventType: (args) => args[0] === 'event' ? 'event' : null,
            eventName: (args) => args[1]
        }
    },
    {
        funcName: 'analytics',  // Segment
        domain: 'cdn.segment.com',
        intercept: {
            eventType: (args) => (args[0] === 'page' || args[0] === 'track') ? args[0] : null,
            eventName: (args) => args[1]
        }
    },
    {
        funcName: 'mixpanel',  // Mixpanel
        domain: 'cdn.mxpnl.com',
        intercept: {
            eventType: (args) => args[0] === 'track' && args[1] === 'page view' ? 'page' : 'event',
            eventName: (args) => args[0] === 'track' ? args[2]['Page Name'] : args[1]
        }
    },
    {
        funcName: 's',  // Adobe Analytics (Omniture)
        domain: 'www.adobe.com',
        intercept: {
            eventType: (args) => args[0] === 't' ? 'page' : null,
            eventName: (args) => location.href
        }
    },
    {
        funcName: 'amplitude',  // Amplitude
        domain: 'cdn.amplitude.com',
        intercept: {
            eventType: (args) => args[0] === 'logEvent' ? 'event' : null,
            eventName: (args) => args[1]
        }
    },
    {
        funcName: 'heap',  // Heap
        domain: 'cdn.heapanalytics.com',
        intercept: {
            eventType: (args) => args[0] === 'track' ? 'event' : null,
            eventName: (args) => args[1]
        }
    },
    {
        funcName: '_paq',  // Matomo (formerly Piwik)
        domain: 'cdn.matomo.cloud',
        intercept: {
            eventType: (args) => {
                if (args[0] === 'trackPageView') return 'page';
                if (args[0] === 'trackEvent') return 'event';
                return null;
            },
            eventName: (args) => args[1]
        }
    },
    {
        funcName: 'KM',
        domain: 'scripts.kissmetrics.com',
        intercept: {
            eventType: (args) => args[0] === 'record' ? 'event' : null,
            eventName: (args) => args[1]
        }
    },
    {
        funcName: 'clicky',
        domain: 'static.getclicky.com',
        intercept: {
            eventType: (args) => args[0] === 'log' ? 'event' : null,
            eventName: (args) => args[1]
        }
    },
    {
        funcName: 'optimizely',
        domain: 'cdn.optimizely.com',
        intercept: {
            eventType: (args) => args[0] === 'push' ? 'event' : null, // Might need refinement based on the type of push events
            eventName: (args) => typeof args[1] === 'object' && args[1].type ? args[1].type : null // Assuming the event details are in the second argument
        }
    },
    {
        funcName: 'woopra',
        domain: 'static.woopra.com',
        intercept: {
            eventType: (args) => args[0] === 'track' ? 'event' : null,
            eventName: (args) => args[1]
        }
    }
];

function prettyLog(ePlatform, eType, eName, eList) {
    console.log("%c !!EVENT!! " + ePlatform + " " + eType + " " + eName, "background-color: green; color:white");
    console.log("%c           " + eList, "background-color: green; color:white");
    console.log("%c           " + window.location.href, "background-color: green; color:white");
}

function createMethodInterceptor(originalFn, methodConfig, platformName) {
    return new Proxy(originalFn, {
        apply: function(target, thisArg, argumentsList) {
            let eventType = methodConfig.eventType(argumentsList);
            let eventName = methodConfig.eventName(argumentsList);

            if (eventType && eventName) {
                let eventDetails = {
                    platform: platformName,
                    eventType: eventType,
                    eventName: eventName
                };
                prettyLog(eventDetails.platform, eventDetails.eventType, eventDetails.eventName, eventDetails.eventList)
                //console.log("%c !!X!! -> " + eventDetails.platform + " " + eventDetails.eventType + ":"+ eventDetails.eventName + "->"+eventDetails.eventList + "<-"+window.location.href, "background-color: green; color:white");
                if (window['Surfly'] && Surfly.currentSession) Surfly.currentSession.log(eventDetails);
            }

            // Forward the call to the original function
            return Reflect.apply(target, thisArg, argumentsList);
        }
    });
}

function initInterceptors() {
    analyticsConfig.forEach(config => {
        if (window[config.funcName]) {
            window[config.funcName] = createMethodInterceptor(window[config.funcName], config.intercept, config.funcName);
        }
    });
}

// Initialize interceptors after document loads
// window.addEventListener('load', initInterceptors);
function monitorWebpage(configs) {
    // Create a map to store interval IDs for each domain
    const intervalMap = new Map();

    // Create a MutationObserver to monitor the DOM for changes
    const observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.nodeName === 'SCRIPT') {
                        for (let config of configs) {
                            const { funcName, domain, intercept } = config;
                            if (node.src.includes(domain) && !intervalMap.has(domain)) {
                                // Start polling for the function
                                const intervalId = setInterval(() => {
                                    if (window[funcName]) {
                                        clearInterval(intervalId);
                                        //intervalMap.delete(domain);
                                        console.log("!!!!!!! Patching: ", funcName, domain, window.location.href);
                                        window[funcName] = createMethodInterceptor(window[funcName], intercept, funcName);
                                        //callback();
                                    }
                                }, 100); // Poll every 100ms
                                intervalMap.set(domain, intervalId);
                            }
                        }
                    }
                }
            }
        }
    });

    // Start observing the document with the configured parameters
    observer.observe(window.document, {
        childList: true,
        subtree: true
    });
}

monitorWebpage(analyticsConfigs);

