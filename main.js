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
		processMessage(senderID,messageText);
	}
}

function processMessage(senderID,messageText){
	if(messageText.includes("tell me about ")){
			text = messageText.replace("tell me about ","");
			duck(senderID,text);
		}
	else if(messageText.includes("weather")){
			weather(senderID,text);
	}
	else if(messageText.includes("show me ")){
			images(senderID,text);
	}
	return messageText;
}
function weather(senderID,text){
text = messageText.replace("weather in ","")

}
function images(snderID,text){
text = messageText.replace("show me ","")
request({
url : "https://api.gettyimages.com/v3/search/images?fields=id,title,thumb,referral_destinations&sort_order=best&phrase="+text,
headers : {
"Api-Key": "kkr5mjrheusxmfxhvxjke83j"
}
},function(err,response,body){
	console.log(body)
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
function sendTextMessage(recID,messText){
	var messageData = {
	recipient : {
		id : recID
	},
	message: {
	text:messText	
	}
}
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
