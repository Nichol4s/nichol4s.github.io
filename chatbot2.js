
    window.__be = window.__be || {};
    window.__be.id = "624c47ee9945060007108d2e";
    (function() {
        var be = document.createElement('script'); be.type = 'text/javascript'; be.async = true;
        be.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.chatbot.com/widget/plugin.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(be, s);
    })();

window.addEventListener("load", function() {  
    document.querySelector(".c-quick-launcher").style.display = "none";
    const sheet = new CSSStyleSheet()
    sheet.insertRule("#einleitung-video { background: yellow; animation: animateBgColor 7s ease-in infinite alternate;}");
    sheet.insertRule("@keyframes animateBgColor { 25%   {background: #7cd3ce;}; 		50%   {background: #f3d600;}; 		75%   {background: #1cbbe3;}");
    document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, sheet]
    document.getElementById('einleitung-video').style = "";
} );

