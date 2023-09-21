const analyticsConfig = [
    {
        name: 'ga',  // Google Universal Analytics
        intercept: {
            eventType: (args) => (args[0] === 'send' && (args[1] === 'pageview' || args[1] === 'event')) ? args[1] : null,
            eventName: (args) => args[1] === 'pageview' ? location.href : (args[1] === 'event' ? args[2] : null)
        }
    },
    {
        name: 'gtag',  // Google Analytics (GA4)
        intercept: {
            eventType: (args) => args[0] === 'event' ? 'event' : null,
            eventName: (args) => args[1]
        }
    },
    {
        name: 'analytics',  // Segment
        intercept: {
            eventType: (args) => (args[0] === 'page' || args[0] === 'track') ? args[0] : null,
            eventName: (args) => args[1]
        }
    },
    {
        name: 'mixpanel',  // Mixpanel
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
                console.log(eventDetails);
                SurflySession.log(eventDetails);
            }

            // Forward the call to the original function
            return Reflect.apply(target, thisArg, argumentsList);
        }
    });
}

function initInterceptors() {
    console.log("SSS! Initializing");
    analyticsConfig.forEach(config => {
        if (window[config.name]) {
            console.log("SSS! Patching... ", config.name);
            window[config.name] = createMethodInterceptor(window[config.name], config.intercept, config.name);
        }
    });
}

// Initialize interceptors after document loads
document.addEventListener('load', initInterceptors);
