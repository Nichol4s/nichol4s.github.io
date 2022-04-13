    window.__be = window.__be || {};
    window.__be.id = "6256f1b23f49ce0007e2acf9";
    (function() {
        var be = document.createElement('script'); be.type = 'text/javascript'; be.async = true;
        be.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.chatbot.com/widget/plugin.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(be, s);
    })();

window.addEventListener("load", function() {  
    document.getElementById("nn_Chatbot").style.display = "none";
    const sheet = new CSSStyleSheet()
    sheet.insertRule(".masthead-content { background: yellow; animation: animateBgColor 7s ease-in infinite alternate;}");
    sheet.insertRule("@keyframes animateBgColor { 25%   {background: #7cd3ce;}; 		50%   {background: #f3d600;}; 		75%   {background: #1cbbe3;}");
    document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, sheet]
} );
