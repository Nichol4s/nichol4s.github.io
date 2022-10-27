// GLOBALS
(window.HUB_EVENTS = {
    ASSET_ADDED: "ASSET_ADDED",
    ASSET_DELETED: "ASSET_DELETED",
    ASSET_DESELECTED: "ASSET_DESELECTED",
    ASSET_SELECTED: "ASSET_SELECTED",
    ASSET_UPDATED: "ASSET_UPDATED",
    CONSOLE_CHANGE: "CONSOLE_CHANGE",
    CONSOLE_CLOSED: "CONSOLE_CLOSED",
    CONSOLE_EVENT: "CONSOLE_EVENT",
    CONSOLE_OPENED: "CONSOLE_OPENED",
    CONSOLE_RUN_COMMAND: "CONSOLE_RUN_COMMAND",
    CONSOLE_SERVER_CHANGE: "CONSOLE_SERVER_CHANGE",
    EMBED_ACTIVE_PEN_CHANGE: "EMBED_ACTIVE_PEN_CHANGE",
    EMBED_ACTIVE_THEME_CHANGE: "EMBED_ACTIVE_THEME_CHANGE",
    EMBED_ATTRIBUTE_CHANGE: "EMBED_ATTRIBUTE_CHANGE",
    EMBED_RESHOWN: "EMBED_RESHOWN",
    FORMAT_FINISH: "FORMAT_FINISH",
    FORMAT_ERROR: "FORMAT_ERROR",
    FORMAT_START: "FORMAT_START",
    IFRAME_PREVIEW_RELOAD_CSS: "IFRAME_PREVIEW_RELOAD_CSS",
    IFRAME_PREVIEW_URL_CHANGE: "IFRAME_PREVIEW_URL_CHANGE",
    KEY_PRESS: "KEY_PRESS",
    LINTER_FINISH: "LINTER_FINISH",
    LINTER_START: "LINTER_START",
    PEN_CHANGE_SERVER: "PEN_CHANGE_SERVER",
    PEN_CHANGE: "PEN_CHANGE",
    PEN_EDITOR_CLOSE: "PEN_EDITOR_CLOSE",
    PEN_EDITOR_CODE_FOLD: "PEN_EDITOR_CODE_FOLD",
    PEN_EDITOR_ERRORS: "PEN_EDITOR_ERRORS",
    PEN_EDITOR_EXPAND: "PEN_EDITOR_EXPAND",
    PEN_EDITOR_FOLD_ALL: "PEN_EDITOR_FOLD_ALL",
    PEN_EDITOR_LOADED: "PEN_EDITOR_LOADED",
    PEN_EDITOR_REFRESH_REQUEST: "PEN_EDITOR_REFRESH_REQUEST",
    PEN_EDITOR_RESET_SIZES: "PEN_EDITOR_RESET_SIZES",
    PEN_EDITOR_SIZES_CHANGE: "PEN_EDITOR_SIZES_CHANGE",
    PEN_EDITOR_UI_CHANGE_SERVER: "PEN_EDITOR_UI_CHANGE_SERVER",
    PEN_EDITOR_UI_CHANGE: "PEN_EDITOR_UI_CHANGE",
    PEN_EDITOR_UI_DISABLE: "PEN_EDITOR_UI_DISABLE",
    PEN_EDITOR_UI_ENABLE: "PEN_EDITOR_UI_ENABLE",
    PEN_EDITOR_UNFOLD_ALL: "PEN_EDITOR_UNFOLD_ALL",
    PEN_ERROR_INFINITE_LOOP: "PEN_ERROR_INFINITE_LOOP",
    PEN_ERROR_RUNTIME: "PEN_ERROR_RUNTIME",
    PEN_ERRORS: "PEN_ERRORS",
    PEN_LIVE_CHANGE: "PEN_LIVE_CHANGE",
    PEN_LOGS: "PEN_LOGS",
    PEN_MANIFEST_CHANGE: "PEN_MANIFEST_CHANGE",
    PEN_MANIFEST_FULL: "PEN_MANIFEST_FULL",
    PEN_PREVIEW_FINISH: "PEN_PREVIEW_FINISH",
    PEN_PREVIEW_START: "PEN_PREVIEW_START",
    PEN_SAVED: "PEN_SAVED",
    POPUP_CLOSE: "POPUP_CLOSE",
    POPUP_OPEN: "POPUP_OPEN",
    POST_CHANGE: "POST_CHANGE",
    POST_SAVED: "POST_SAVED",
    PROCESSING_FINISH: "PROCESSING_FINISH",
    PROCESSING_START: "PROCESSED_STARTED",
}),
    "object" != typeof window.CP && (window.CP = {}),
    (window.CP.PenTimer = {
        programNoLongerBeingMonitored: !1,
        timeOfFirstCallToShouldStopLoop: 0,
        _loopExits: {},
        _loopTimers: {},
        START_MONITORING_AFTER: 2e3,
        STOP_ALL_MONITORING_TIMEOUT: 5e3,
        MAX_TIME_IN_LOOP_WO_EXIT: 2200,
        exitedLoop: function (E) {
            this._loopExits[E] = !0;
        },
        shouldStopLoop: function (E) {
            if (this.programKilledSoStopMonitoring) return !0;
            if (this.programNoLongerBeingMonitored) return !1;
            if (this._loopExits[E]) return !1;
            var _ = this._getTime();
            if (0 === this.timeOfFirstCallToShouldStopLoop)
                return (this.timeOfFirstCallToShouldStopLoop = _), !1;
            var o = _ - this.timeOfFirstCallToShouldStopLoop;
            if (o < this.START_MONITORING_AFTER) return !1;
            if (o > this.STOP_ALL_MONITORING_TIMEOUT)
                return (this.programNoLongerBeingMonitored = !0), !1;
            try {
                this._checkOnInfiniteLoop(E, _);
            } catch {
                return (
                    this._sendErrorMessageToEditor(),
                    (this.programKilledSoStopMonitoring = !0),
                    !0
                );
            }
            return !1;
        },
        _sendErrorMessageToEditor: function () {
            try {
                if (this._shouldPostMessage()) {
                    var E = {
                        topic: HUB_EVENTS.PEN_ERROR_INFINITE_LOOP,
                        data: { line: this._findAroundLineNumber() },
                    };
                    parent.postMessage(E, "*");
                } else this._throwAnErrorToStopPen();
            } catch {
                this._throwAnErrorToStopPen();
            }
        },
        _shouldPostMessage: function () {
            return document.location.href.match(/boomboom/);
        },
        _throwAnErrorToStopPen: function () {
            throw "We found an infinite loop in your Pen. We've stopped the Pen from running. More details and workarounds at https://blog.codepen.io/2016/06/08/can-adjust-infinite-loop-protection-timing/";
        },
        _findAroundLineNumber: function () {
            var E = new Error("ignored"),
                _ = 0;
            if (E.stack) {
                var o = E.stack.match(/boomboom\S+:(\d+):\d+/);
                o && (_ = o[1]);
            }
            return _;
        },
        _checkOnInfiniteLoop: function (E, _) {
            if (!this._loopTimers[E]) return (this._loopTimers[E] = _), !1;
            if (_ - this._loopTimers[E] > this.MAX_TIME_IN_LOOP_WO_EXIT)
                throw "Infinite Loop found on loop: " + E;
        },
        _getTime: function () {
            return Date.now();
        },
    }),
    (window.CP.shouldStopExecution = function (E) {
        var _ = window.CP.PenTimer.shouldStopLoop(E);
        return (
            !0 === _ &&
                console.warn(
                    "[CodePen]: An infinite loop (or a loop taking too long) was detected, so we stopped its execution. More details at https://blog.codepen.io/2016/06/08/can-adjust-infinite-loop-protection-timing/"
                ),
            _
        );
    }),
    (window.CP.exitedLoop = function (E) {
        window.CP.PenTimer.exitedLoop(E);
    });

const styles = `
html,
body {
  height: 100vh;
  background-color: black;
  margin: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: none;
}
#layer {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
}
.ghost {
  position: absolute;
  z-index: 1;
  transform-origin: center;
  width: 90px;
  margin: 20px 0 0 -45px;
}
.ghost__eyes, .ghost__mouth {
  position: absolute;
  z-index: 1;
  width: 15px;
  height: 15px;
  top: 34px;
  left: 50%;
  transform: translate(-50%);
  border-radius: 50px;
  background: #161616;
  margin-left: -20px;
  transform-origin: center;
}
.ghost__eyes {
  box-shadow: 40px 0 0 #161616;
}
.ghost__mouth {
  margin: 0;
  top: 60px;
  transform: scale(0);
  border-radius: 20px 20px 12px 12px;
  width: 20px;
  trasform-origin: center bottom;
  overflow: hidden;
}
.ghost__tail {
  position: absolute;
  z-index: -1;
  top: 82px;
  height: 55px;
  width: 100%;
  filter: url(#goo);
}
.ghost__tail:before {
  content: "";
  background: #fff;
  position: absolute;
  bottom: 35px;
  left: 0;
  height: 100px;
  width: 100%;
  border-radius: 40px 40px 5px 5px;
}
.ghost__rip {
  width: 15px;
  height: 28px;
  background: #fff;
  position: absolute;
  top: 15px;
  left: 0;
  box-shadow: -62px 0 0 #fff, -31px 0 0 #fff, 31px 0 0 #fff, 62px 0 0 #fff, 93px 0 0 #fff;
  border-radius: 50%;
  -webkit-animation: ghost-rips 1.2s linear infinite;
          animation: ghost-rips 1.2s linear infinite;
}

@-webkit-keyframes ghost-rips {
  0% {
    left: 0;
    top: 12px;
  }
  50% {
    left: 31px;
    top: 20px;
  }
  100% {
    left: 62px;
    top: 12px;
  }
}

@keyframes ghost-rips {
  0% {
    left: 0;
    top: 12px;
  }
  50% {
    left: 31px;
    top: 20px;
  }
  100% {
    left: 62px;
    top: 12px;
  }
}

#hello {
  //background-color: rgb(255, 0, 0, 0.2);
  position:absolute;
  top:0;
  width:100%;
  height:800px;
}


/* leaf animations */

#leaves {position:relative;top:-50px;width:100%;text-align: right;}

#leaves i {
    display: inline-block;
    width: 200px;
    height: 150px;
    background: linear-gradient(to bottom right, #309900, #005600);
    transform: skew(20deg);
    border-radius: 5% 40% 70%;
    box-shadow: inset 0px 0px 1px #222;
    border: 1px solid #333;
    z-index: 1;
    -webkit-animation: falling 5s 0s infinite;
}

#leaves i:nth-of-type(2n) { -webkit-animation: falling2 5s 0s infinite; }
#leaves i:nth-of-type(3n) { -webkit-animation: falling3 5s 0s infinite; }

#leaves i:before {
  position: absolute;
  content: '';
  top: 117px;
  right: 9px;
  height: 27px;
  width: 32px;
  transform: rotate(49deg);
  border-radius: 0% 15% 15% 0%;
  border-top: 1px solid #222;
  border-bottom: 1px solid #222;
  border-left: 0px solid #222;
  border-right: 1px solid #222;
  background: linear-gradient(to right, rgba(0,100,0,1), #005600);
  z-index: 1;
}

#leaves i:after {
  content: '';
  height: 125px;
  width: 10px;
  background: linear-gradient(to right, rgba(0,0,0,.15), rgba(0,0,0,0));
  display: block;
  transform: rotate(125deg);
  position: absolute;
  left: 85px;
  border-radius:50%;
}


#leaves i:nth-of-type(n)    { height:23px; width:30px; }
#leaves i:nth-of-type(n):before { width:7px; height:5px; top:17px; right:1px; }
#leaves i:nth-of-type(n):after { width:2px; height:17px; left: 12px; top:0px; }

#leaves i:nth-of-type(2n+1)    { height:11px; width:16px; }
#leaves i:nth-of-type(2n+1):before { width:4px; height:3px; top:7px; right:0px; }
#leaves i:nth-of-type(2n+1):after { width:2px; height:6px; left: 5px; top:1px; }

#leaves i:nth-of-type(3n+2)  { height:17px; width:23px; }
#leaves i:nth-of-type(3n+2):before  { height:4px; width:4px; top:12px; right:1px; }
#leaves i:nth-of-type(3n+2):after  { height:10px; width:2px; top:1px; left:8px; }

#leaves i:nth-of-type(n)   { -webkit-animation-delay: 1.9s;}
#leaves i:nth-of-type(2n)  { -webkit-animation-delay: 3.9s;}
#leaves i:nth-of-type(3n)  { -webkit-animation-delay: 2.3s;}
#leaves i:nth-of-type(4n)  { -webkit-animation-delay: 4.4s;}
#leaves i:nth-of-type(5n)  { -webkit-animation-delay: 5s;  }
#leaves i:nth-of-type(6n)  { -webkit-animation-delay: 3.5s;}
#leaves i:nth-of-type(7n)  { -webkit-animation-delay: 2.8s;}
#leaves i:nth-of-type(8n)  { -webkit-animation-delay: 1.5s;}
#leaves i:nth-of-type(9n)  { -webkit-animation-delay: 3.3s;}
#leaves i:nth-of-type(10n) { -webkit-animation-delay: 2.5s;}
#leaves i:nth-of-type(11n) { -webkit-animation-delay: 1.2s;}
#leaves i:nth-of-type(12n) { -webkit-animation-delay: 4.1s;}
#leaves i:nth-of-type(13n) { -webkit-animation-delay: 1s;  }
#leaves i:nth-of-type(14n) { -webkit-animation-delay: 4.7s;}
#leaves i:nth-of-type(15n) { -webkit-animation-delay: 3s;  }

#leaves i:nth-of-type(n)    { background: linear-gradient(to bottom right, #309900, #005600); }
#leaves i:nth-of-type(2n+2)  { background: linear-gradient(to bottom right, #5e9900, #2b5600); }
#leaves i:nth-of-type(4n+1)  { background: linear-gradient(to bottom right, #990, #564500); }

#leaves i:nth-of-type(n)    { opacity: .7;}
#leaves i:nth-of-type(3n+1)  { opacity: .5;}
#leaves i:nth-of-type(3n+2)  { opacity: .3;}

#leaves i:nth-of-type(n)    {transform: rotate(180deg);}


#leaves i:nth-of-type(n) { -webkit-animation-timing-function:ease-in-out;}

@-webkit-keyframes falling {
    
    0% {
        -webkit-transform:
            translate3d(300,0,0)
            rotate(0deg);
    }
    
    100% {
        -webkit-transform:
            translate3d(-350px,700px,0)
            rotate(90deg);
        opacity: 0;
    }
}

@-webkit-keyframes falling3 {
     0% {
        -webkit-transform:
            translate3d(0,0,0)
            rotate(-20deg);
    }
    
    100% {
        -webkit-transform:
            translate3d(-230px,640px,0)
            rotate(-70deg);
        opacity: 0;
    }
}

@-webkit-keyframes falling2 {
     0% {
        -webkit-transform:
            translate3d(0,0,0)
            rotate(90deg);
    }
    
    100% {
        -webkit-transform:
            translate3d(-400px,680px,0)
            rotate(0deg);
        opacity: 0;
    }
}
`;

// Append styles
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

// Ghost HTML

const ghostDiv = document.createElement("div");
ghostDiv.id = "ghost";
ghostDiv.classList.add("ghost");
ghostDiv.innerHTML = `
  <div class="ghost__head">
    <div class="ghost__eyes"></div>
    <div class="ghost__mouth"></div>
  </div>
  <div class="ghost__tail">
    <div class="ghost__rip"></div>
  </div>
`;

const ghostSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
ghostSvg.innerHTML = `
  <defs>
    <filter id="goo">
      <feGaussianBlur
        in="SourceGraphic"
        stdDeviation="10"
        result="ghost-blur" />
      <feColorMatrix
        in="ghost-blur"
        mode="matrix"
        values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 16 -7"
        result="ghost-gooey" />
    </filter>
  </defs>
`;

const fragment = new DocumentFragment();

fragment.appendChild(ghostDiv);
fragment.appendChild(ghostSvg);

// Leaves HTML
const leavesDiv = document.createElement("div");
leavesDiv.classList.add("leaves");
for (let i = 0; i < 15; i++) {
    leavesDiv.appendChild(document.createElement("i"));
}
fragment.appendChild(leavesDiv);

document.body.appendChild(fragment);

setTimeout(() => {
    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        dir: "",
    };
    let clicked = false;
    const getMouse = (e) => {
        mouse = {
            x:
                e.clientX ||
                e.pageX ||
                e.touches?.[0]?.pageX ||
                0 ||
                window.innerWidth / 2,
            y:
                e.clientY ||
                e.pageX ||
                e.touches?.[0]?.pageY ||
                0 ||
                window.innerHeight / 2,
            dir: getMouse.x > e.clientX ? "left" : "right",
        };
    };
    ["mousemove", "touchstart", "touchmove"].forEach((e) => {
        window.addEventListener(e, getMouse);
    });
    window.addEventListener("mousedown", (e) => {
        e.preventDefault();
        clicked = true;
    });
    window.addEventListener("mouseup", () => {
        clicked = false;
    });

    class GhostFollow {
        constructor(options) {
            Object.assign(this, options);

            this.el = document.querySelector("#ghost");
            this.mouth = document.querySelector(".ghost__mouth");
            this.eyes = document.querySelector(".ghost__eyes");
            this.pos = {
                x: 0,
                y: 0,
            };
        }

        follow() {
            this.distX = mouse.x - this.pos.x;
            this.distY = mouse.y - this.pos.y;

            this.velX = this.distX / 8;
            this.velY = this.distY / 8;

            this.pos.x += this.distX / 10;
            this.pos.y += this.distY / 10;

            this.skewX = map(this.velX, 0, 100, 0, -50);
            this.scaleY = map(this.velY, 0, 100, 1, 2.0);
            this.scaleEyeX = map(Math.abs(this.velX), 0, 100, 1, 1.2);
            this.scaleEyeY = map(Math.abs(this.velX * 2), 0, 100, 1, 0.1);
            this.scaleMouth = Math.min(
                Math.max(
                    map(Math.abs(this.velX * 1.5), 0, 100, 0, 10),
                    map(Math.abs(this.velY * 1.2), 0, 100, 0, 5)
                ),
                2
            );

            if (clicked) {
                this.scaleEyeY = 0.4;
                this.scaleMouth = -this.scaleMouth;
            }

            this.el.style.transform =
                "translate(" +
                this.pos.x +
                "px, " +
                this.pos.y +
                "px) scale(.7) skew(" +
                this.skewX +
                "deg) rotate(" +
                -this.skewX +
                "deg) scaleY(" +
                this.scaleY +
                ")";
            this.eyes.style.transform =
                "translateX(-50%) scale(" +
                this.scaleEyeX +
                "," +
                this.scaleEyeY +
                ")";
            this.mouth.style.transform =
                "translate(" +
                (-this.skewX * 0.5 - 10) +
                "px) scale(" +
                this.scaleMouth +
                ")";
        }
    }

    /*--------------------
Map
--------------------*/
    function map(num, in_min, in_max, out_min, out_max) {
        return (
            ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
        );
    }

    /*--------------------
Init
--------------------*/
    const cursor = new GhostFollow();

    /*--------------------
Render
--------------------*/
    const render = () => {
        requestAnimationFrame(render);
        cursor.follow();
    };
    render();
});
