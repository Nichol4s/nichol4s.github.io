//
const analyticsConfigs = [
    {
        funcName: 'ga',  // Google Universal Analytics
        domain: 'www.google-analytics.com',
        intercept: {
            eventType: (args) => (args[0] === 'send' && (args[1] === 'pageview' || args[1] === 'event')) ? args[1] : null,
            eventName: (args) => args[1] === 'pageview' ? location.href : (args[1] === 'event' ? args[2] : null)
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
    }
];

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
                console.log("SSS!! ->",eventDetails);
                if (window['Surfly'] && Surfly.currentSession) Surfly.currentSession.log(eventDetails);
            }

            // Forward the call to the original function
            return Reflect.apply(target, thisArg, argumentsList);
        }
    });
}

function initInterceptors() {
    console.log("SSS! Initializing2");
    analyticsConfig.forEach(config => {
        if (window[config.funcName]) {
            console.log("SSS! Patching... ", config.funcName);
            window[config.funcName] = createMethodInterceptor(window[config.funcName], config.intercept, config.funcName);
        }
    });
}

// Initialize interceptors after document loads
// window.addEventListener('load', initInterceptors);
function monitorWebpage(configs) {
    console.log("!!!S monitoring the web page!", window.location.href);
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

