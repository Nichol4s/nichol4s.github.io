
const analyticsConfig = [
    {
        name: 'ga',  // Google Analytics (Universal Analytics)
        domain: 'www.google-analytics.com',
        methods: {
            send: {
                methodName: 'send',
                pageArg: (args) => args[0] === 'pageview' ? location.href : null,
                eventArg: (args) => args[0] === 'event' ? args[1] : null
            }
        }
    },
    {
        name: 'gtag',  // Google Analytics (GA4)
        domain: 'www.googletagmanager.com',
        methods: {
            config: {
                methodName: 'config',
                pageArg: (args) => args[2] && args[2].page_path,
                eventArg: null
            },
            event: {
                methodName: 'event',
                pageArg: null,
                eventArg: 0
            }
        }
    },
    {
        name: 's',  // Adobe Analytics (Omniture)
        domain: 'www.adobe.com',
        methods: {
            t: {
                methodName: 't',
                pageArg: (args, context) => context.pageName,
                eventArg: null  // Event tracking with s.tl() might need additional logic
            }
        }
    },
    {
        name: 'mixpanel',  // Mixpanel
        domain: 'cdn.mxpnl.com',
        methods: {
            track: {
                methodName: 'track',
                pageArg: (args) => args[0] === 'page view' ? args[1]['Page Name'] : null,
                eventArg: 0
            }
        }
    },
    {
        name: 'analytics',  // Segment
        domain: 'cdn.segment.com',
        methods: {
            page: {
                methodName: 'page',
                pageArg: 0,
                eventArg: null
            },
            track: {
                methodName: 'track',
                pageArg: null,
                eventArg: 0
            }
        }
    },
    {
        name: 'amplitude',  // Amplitude
        domain: 'cdn.amplitude.com',
        methods: {
            logEvent: {
                methodName: 'logEvent',
                pageArg: null,  // Typical Amplitude setups may not have explicit page tracking
                eventArg: 0
            }
        }
    },
    {
        name: 'heap',  // Heap
        domain: 'cdn.heapanalytics.com',
        methods: {
            track: {
                methodName: 'track',
                pageArg: null,  // No explicit page tracking in typical Heap setups
                eventArg: 0
            }
        }
    },
    {
        name: '_paq',  // Matomo (formerly Piwik)
        domain: 'cdn.matomo.cloud',
        methods: {
            trackPageView: {
                methodName: 'trackPageView',
                pageArg: 0,
                eventArg: null
            },
            trackEvent: {
                methodName: 'trackEvent',
                pageArg: null,
                eventArg: 1
            }
        }
    }
];


function methodInterceptor(target, config, platform) {
    const proxy = new Proxy(target, {
        apply: function (target, thisArg, argumentsList) {
            let eventDetails = {
                platform: platform,
                eventType: null,
                eventName: null
            };

            if (config.pageArg) {
                const pageName = typeof config.pageArg === "function" ? config.pageArg(argumentsList) : argumentsList[config.pageArg];
                if (pageName) {
                    eventDetails.eventType = 'pageview';
                    eventDetails.eventName = pageName;
                    console.log(`[PAGE]: ${pageName}`);
                }
            }

            if (config.eventArg) {
                const eventName = typeof config.eventArg === "function" ? config.eventArg(argumentsList) : argumentsList[config.eventArg];
                if (eventName) {
                    eventDetails.eventType = 'event';
                    eventDetails.eventName = eventName;
                    console.log(`[EVENT]: ${eventName}`);
                }
            }

            // Send the log to SurflySession if an event type was captured
            if (eventDetails.eventType) {
                SurflySession.log(eventDetails);
            }

            return Reflect.apply(target, thisArg, argumentsList);
        }
    });
    proxy.__isIntercepted = true; 
    return proxy;
}


function isAlreadyIntercepted(fn) {
    return !!fn.__isIntercepted;
}

const intervalID = setInterval(() => {
    let allFound = true; // To check if we've found all analytics tools.

    analyticsConfig.forEach(config => {
        if (!window[config.name] || (window[config.name] && window[config.name].__isIntercepted)) {
            allFound = false;
            return;
        }
        
        console.log("SSS -> Checking for", config.name);
        
        if (config.methods) {
            for (let method in config.methods) {
                if (typeof window[config.name] === 'function' && window[config.name][config.methods[method].methodName] && !isAlreadyIntercepted(window[config.name][config.methods[method].methodName])) {
                    console.log("SSS ---> applying function");
                    window[config.name][config.methods[method].methodName] = methodInterceptor(window[config.name][config.methods[method].methodName], config.methods[method], config.name);
                } else if (typeof window[config.name] === 'object' && window[config.name].push && !isAlreadyIntercepted(window[config.name].push)) {
                    // Handling analytics tools that use array-like structures, e.g., _paq for Matomo
                    console.log("SSS ---> applying object");
                    window[config.name].push = methodInterceptor(window[config.name].push, config.methods[method], config.name);
                }
            }
        }
    });

    // If we've found all the analytics tools, clear the interval.
    if (allFound) {
        clearInterval(intervalID);
    }
}, 1000); // Check every 1000 ms.


