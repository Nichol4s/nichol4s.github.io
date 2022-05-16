var sheets = ["https://source.zoom.us/{VERSION_NUMBER}/css/bootstrap.css", 
              "https://source.zoom.us/{VERSION_NUMBER}/css/react-select.css"]
var scripts = ["https://source.zoom.us/{VERSION_NUMBER}/lib/vendor/react.min.js", 
               "https://source.zoom.us/{VERSION_NUMBER}/lib/vendor/react-dom.min.js", 
               "https://source.zoom.us/{VERSION_NUMBER}/lib/vendor/redux.min.js",
               "https://source.zoom.us/{VERSION_NUMBER}/lib/vendor/redux-thunk.min.js",
               "https://source.zoom.us/{VERSION_NUMBER}/lib/vendor/lodash.min.js",
               "https://source.zoom.us/{VERSION_NUMBER}/zoom-meeting-embedded-{VERSION_NUMBER}.min.js"]

var ZOOM_VERSION = "2.4.0";
var ZOOM_SDK = "1IO3TPm_RuyNZJeo4jq-iQ";
var ZOOM_MEETINGNO = 4237232374;



window.addEventListener("load", function() { 

               

  
var bdy = document.body;

sheets.forEach(function(sheet) {
  var newEl = document.createElement('link');
  newEl.setAttribute("type","text/css");
  newEl.setAttribute("rel", "stylesheet");
  newEl.setAttribute("href", sheet.replace("{VERSION_NUMBER}", ZOOM_VERSION));
  console.log(newEl);
  bdy.appendChild(newEl);
});

scripts.forEach(function(script)  {
  var newEl = document.createElement('script')
  newEl.setAttribute("src", script.replace(/{VERSION_NUMBER}/g, ZOOM_VERSION));
  console.log(newEl);
  bdy.appendChild(newEl);
});

var newEl = document.createElement('div')
newEl.setAttribute("id", "meetingSDKElement");
bdy.appendChild(newEl);
  


const postData = {'meetingNumber': 4237232374, 'role': 0};  
fetch( "https://zoom-surfly-signature.herokuapp.com/", {
        body: JSON.stringify(postData),
        headers: {'Content-Type': 'application/json',},
        method: "post"
    }).then( (response) => { response.json().then(data => {
                          
var ZOOM_SIG = data.signature;      

    const client = window.ZoomMtgEmbedded.createClient();
    let meetingSDKElement = document.getElementById('meetingSDKElement')

client.init({
  debug: true,
  zoomAppRoot: meetingSDKElement,
  language: 'en-US',
  customize: {
    meetingInfo: [
      'topic',
      'host',
      'mn',
      'pwd',
      'telPwd',
      'invite',
      'participant',
      'dc',
      'enctype',
    ],
    toolbar: {
      buttons: [
        {
          text: 'Custom Button',
          className: 'CustomButton',
          onClick: () => {
            console.log('custom button')
          }
        }
      ]
    }
  }
})
console.log("Joining....: ", ZOOM_SDK, ZOOM_SIG, ZOOM_MEETINGNO);
client.join({
  sdkKey: ZOOM_SDK,
  signature: ZOOM_SIG, // role in SDK Signature needs to be 0
  meetingNumber: ZOOM_MEETINGNO,
  password: "",
  userName: "Nicholas"
})
}, 1000);

  
} );

});
