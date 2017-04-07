express = require('express');
https = require('https');
request = require('request');
var app = express();
port = Number(process.env.PORT || 5000);
var city,text,temp,temperature;
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
access_token="EAAXo0ZADqGgkBAFRAoQYZB8zZAGr47ci68Q17zBqWKsiiLImBMZAuZBIJd3R7k7pSEBPlHHKOTv4AADnZBQwNZBVQg34ky7hFgbQukq8ZAeGyan9IV5MPDKrYaYC5zopBum5YDSj5ruiWDTSAeCAGYWLVh9XZAoVZC16FJ1qpusiGjFAZDZD";
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'Vincent') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});
var teams = ["Delhi Daredevils","Royal Challengers Bangalore","Kings XI Punjab","Rising Pune Supergiant","Kolkata Knight Riders","Gujarat Lions","Sunrisers Hyderabad","Mumbai Indians"]
app.post('/webhook', function (req, res) {
	var data = req.body;
	if(data.object === 'page'){
	data.entry.forEach(function(entry){
		var pageId = entry.id;
		var time = entry.time;
		entry.messaging.forEach(function(event){
		if(event.message){
			receivedMessage(event);		
		}
		else{
			console.log("Unknown event : ",event);
		}
	});
});
res.sendStatus(200);
}
});

function receivedMessage(event){
	message = event.message;
	senderID = event.sender.id;
	console.log("received message from "+event.sender.id);
	var messageText = message.text;
	var messageAttachments = message.attachments;
	if(messageText){
		processMessage(senderID,messageText.toLowerCase());
	}
}

function processMessage(senderID,messageText){
	if(messageText.includes("tell me about ")){
			wiki(senderID,messageText)
		}
	else if(messageText.includes("weather")){
			weather(senderID,messageText);
	}
	else if(messageText.includes("show me ")){
			images(senderID,messageText)
	}
	else if(messageText.includes("#words ")){
			words(senderID,messageText)
	}
	else if(messageText.includes("#videos ")){
			videos(senderID,messageText)
	}
	else if(messageText.includes("#cricket")){
			cricket(senderID,messageText)
	}
	return messageText;
}
function weather(senderID,text){
text = text.replace("weather in ","")
	
}
function cricket(senderID,text){
	request({
    	headers: {
		"apikey": "4362b8401628e2f5e9cc9740610711d1"
    	},
   	uri: "http://cricapi.com/api/matches",
   	}, function (err, res, body) {
	if(!err){
	var arr = []
	console.log(":'( :'( yasss!!"+body)
	
	body.forEach(function(match){
		teams.forEach(function(team){
			if(match["team-1"].contains(team))
				score(senderID,match["unique_id"])
		})
		if(match.squad&&match.matchStarted){
		arr.push({
		"content_type":"text",
        	"title":match["team-1"]+"vs"+match["team-2"],
        	"payload":"#scores "+match["unique_id"]
		})
		title = "No IPL or Indian matches going on currently."	
		sendQuick(senderID,title,arr)
		}
	}
	})
	})
}
function score(senderID,id){
	request({
    	headers: {
		"unique_id": id,
		"apikey": "4362b8401628e2f5e9cc9740610711d1"
    	},
   	uri: "http://cricapi.com/api/cricketScore",
   	}, function (err, res, body) {
		console.log(body)
	})
}
function wiki(senderID,text){
text = text.replace("tell me about ","")
	console.log(text)
request({
    url:"https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1&exsentences=3&titles="+text,
    json:true
  }, function(error, res, body){
	var key = Object.keys(body.query.pages)
	text = body.query.pages[key[0]].extract
	console.log(key[0] + "  "+text)
	sendTextMessage(senderID,text)
})
}

function videos(senderID,text){
text = text.replace("#videos ","")
request({
    url:"https://www.googleapis.com/youtube/v3/search?key=AIzaSyCsojMsfWiHhc4RwlXmfGBbNy747m5oAk9&part=snippet&q="+text,
    json:true
  }, function(error, res, body){
           if(!error){
   		if(body!= null){
    			var inko = []
			
			var i=0;
			body.items.forEach ( function(ink) {
			if(i<8){
				if(ink.id.kind == "youtube#channel")
					  id = "channel/"+ink.id.channelId
				else
					  id = "watch?v="+ink.id.videoId
				//console.log(ink.items.title+" "+ ink.volumeInfo.authors)
				inko.push({
					"title":ink.snippet.title,
					"image_url":ink.snippet.thumbnails.high.url,
					"subtitle":ink.snippet.description,
					"default_action": {
					      "type": "web_url",
					      "url":"https://www.youtube.com/"+id,
					}
				  })
			      	i++
			}
			})
			data = {
				"type":"template",
				"payload":{
					"template_type":"generic",
					"elements":inko
				}
			}
		sendAttachment(senderID,data)
    		}
           }//error
           else
           console.log(error)
  })
}

function words(senderID, text){
text = text.replace("#words ","")
request({
    headers: {
  "app_id": "c8d9fc8b",
  "app_key": "4362b8401628e2f5e9cc9740610711d1"
    },
    uri: 'https://od-api.oxforddictionaries.com:443/api/v1/entries/en/'+text,
    //body: formData,
    //method: 'POST'
  }, function (err, res, body) {
    console.log(JSON.parse(res.body).results[0].lexicalEntries);
    var wdata = JSON.parse(res.body);
    var word_description = "Word: "+wdata.results[0].id+" "+"( "+wdata.results[0].lexicalEntries[0].lexicalCategory+" )\r\n"
                            +wdata.results[0].lexicalEntries[0].pronunciations[0].phoneticSpelling+"\r\n"+
                             "Meaning: "+wdata.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]+"\r\n"+
                             "Example: " +wdata.results[0].lexicalEntries[0].entries[0].senses[0].examples[0].text+"."
                             console.log(word_description)
    link = wdata.results[0].lexicalEntries[0].pronunciations[0].audioFile;
                             sendTextMessage(senderID,word_description)
    
  });
}
function images(snderID,text){
text = text.replace("show me ","")
request({
url : "https://api.gettyimages.com/v3/search/images?fields=id,title,thumb,referral_destinations&sort_order=best&phrase="+text,
headers : {
"Api-Key": "kkr5mjrheusxmfxhvxjke83j"
}
},function(err,response,body){
	if(!err){
		console.log(JSON.parse(body))
			elem = []
			count = 0
			img = JSON.parse(body)
			img.images.forEach(function(i){
				if(count++<5){
					console.log(i.display_sizes)
					json = {
						    "title":i.title,
						    "image_url":i.display_sizes[0].uri,
						    "buttons":[
						      {
							"type":"postback",
							"title":"Check image",
							"payload":"img "+i.display_sizes[0].uri
						      }              
						    ]        
					}
					elem.push(json)
					sendImage(snderID,i.display_sizes[0].uri)
				}
			})
			data = {
				"type":"template",
				"payload":{
					"template_type":"generic",
					"elements":elem
				}
			}
		//sendAttachment(snderID,data)
		}
	else{
	console.log(err)
	}
	})
}

function duck(senderID,text){
Burl = "http://api.duckduckgo.com/?q="+text+"&format=json&pretty=1";
	request({
	url : Burl,
	json : true 	
	},function(error,response,body){
	if(!error){
		if(body!=null){
			if(body.Abstract==null){
			if(body.Definition==null){
				str = body.Results;
			}
			else
			str = body.Definition;
			}
			else
			str = body.Abstract;
			sendImage(senderID,body.Image);
			sendTextMessage(senderID,str);	
		}	
	}	
});

}
function sendQuick(recID,title,array){
	var messageData = {
		recipient : {
			id : recID	
		},
		message : {
			"text":title,
    			"quick_replies":array
		}
	}
	sendMessage(messageData);
}
function sendTextMessage(recID,messText){
	var messageData = {
	recipient : {
		id : recID
	},
	message: {
	text:messText	
	}
}
	console.log(messText)
	sendMessage(messageData);
}
function sendAttachment(recID,attach){
	var messageData = {
	recipient : {
		id : recID	
	},
	message : {
		attachment :attach
	}
}
	console.log("attaching : "+attach);
	sendMessage(messageData);

}
function sendImage(recId,Iurl){
	var messageData = {
	recipient : {
		id : recId	
	},
	message : {
		attachment : {
			type : "image",
			payload : {
				url : Iurl		
			} 
		}
	}
}
	console.log("imaging : "+Iurl);
	sendMessage(messageData);
}
function sendVideo(recId,Iurl){
	var messageData = {
	recipient : {
		id : recId	
	},
	message : {
		attachment : {
			type : "video",
			payload : {
				url : Iurl		
			} 
		}
	}
}
	console.log("imaging : "+Iurl);
	sendMessage(messageData);
}
function sendMessage(messageData){
request({
	uri: 'https://graph.facebook.com/v2.6/me/messages',
  	qs: { access_token: access_token },
    	method: 'POST',
    	json: messageData
	
},function (error,response,body){
	if(!error){
		console.log("message sent");	
	}	
});
}
app.listen(port);
