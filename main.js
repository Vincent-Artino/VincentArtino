express = require('express');
https = require('https');
request = require('request');
var app = express();
port = Number(process.env.PORT || 5000);
var city,text,temp,temperature;
var bot_name = "vincent"
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var location = []
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
var GetStartedButton = {
  "get_started":{
    "payload":"Get started"
  }
}
var greetingText = {
  "greeting":[
    {
      "locale":"default",
      "text":"Hello!"
    }
  ]
}
var persistentMenu = {
  "persistent_menu":[
    {
      "locale":"default",
      "composer_input_disabled":false,
      "call_to_actions":[
        {
          "title":"Settings",
          "type":"nested",
          "call_to_actions":[
            {
              "title":"Weather",
              "type":"postback",
              "payload":"weather postback"
            },
            {
              "title":"Location",
              "type":"postback",
              "payload":"location payload"
            },
            {
              "title":"News",
              "type":"postback",
              "payload":"news payload"
            }
          ]
        },
        {
          "type":"postback",
          "title":"Help",
	  "payload":"help"	
        },
      	{
	  "type":"postback",
	  "title":"About me",
	  "payload":"about"
      	}
      ]
    }
  ]
}
//threadSetUp(GetStartedButton)
//threadSetUp(greetingText)
//threadSetUp(persistentMenu)
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
		else if(event.postback){
			if(event.postback.payload=='Get started'){
				console.log(getDetails(event.sender.id))
				//sendTextMessage(event.sender.id,"Hello "+getFirstName(event.sender.id))
				var loc = [
				      {
					"content_type":"location",
				      }
				]
				sendQuick(event.sender.id,"please set a default location",loc)
			}
		}
		else{
			console.log("Unknown event : ",event);
		}
	});
});

res.sendStatus(200);
}
});

function getDetails(senderID){
	var first_name=""
	request({
		uri: 'https://graph.facebook.com/v2.6/'+senderID+'?fields=first_name,last_name,gender&access_token='+access_token,
		qs: { access_token: access_token },
		method: 'GET'
	},function (error,response,body){
		if(!error){
			console.log(body)
			var loc = []
			loc['lat']='NA'
			loc['lon']='NA'
			location[senderID.toString()]=loc
			first_name = body.first_name
		}	
	});
	return first_name
}

function receivedMessage(event){
	var message = event.message;
	var senderID = event.sender.id;
	var messageText = message.text;
	var messageAttachments = message.attachments 
	
	if(messageText){
		if(message.quick_reply){
			var payload = message.quick_reply.payload
			if(message.quick_reply.payload.includes("#scores ")){
				score(senderID,payload.replace("#scores ",""))
			}
			else if(message.quick_reply.payload.includes("#pl ")){
				places(senderID,message.quick_reply.payload)
			}
		}
		else
		processMessage(senderID,messageText.toLowerCase());
	}
	else if(messageAttachments){
			console.log(messageAttachments)
			console.log(messageAttachments[0].payload.coordinates)
			if(location[senderID.toString()]['lat']=='NA'&&location[senderID.toString()]['lon']=='NA'){
				var loc = []
				loc['lat']=messageAttachments[0].payload.coordinates.lat
				loc['lon']=messageAttachments[0].payload.coordinates.long
				location[senderID.toString()]=loc
				console.log("set")
			}
			sendTextMessage(senderID,"Default Location set!!")
			console.log(location[senderID.toString()])
		}
	else{
	console.log(event)
	}
}

function processMessage(senderID,messageText){
	if(messageText.includes("tell me about ")){
			wiki(senderID,messageText)
		}
	else if(messageText.includes("weather in ")){
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
			cricket(senderID)
	}
	else if(messageText.includes("#news")){
			news(senderID)
	}
	else if(messageText.includes("#places")){
			places(senderID,"#pl ")
	}
}
function places(senderID,text){
	var query = text.replace("#pl ","")
	console.log("in places "+location)
	var coord = location[senderID.toString()]['lat']+","+location[senderID.toString()]['lon']
	var imgBaseURL = "https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyCsojMsfWiHhc4RwlXmfGBbNy747m5oAk8&photoreference="
	console.log(coord)
	if(query==''){
		var data = [{
				"content_type":"text",
				"title":"hospitals",
				"payload":"#pl hospital"
			},{
				"content_type":"text",
				"title":"restaurants",
				"payload":"#pl restaurant"
			},{
				"content_type":"text",
				"title":"atms",
				"payload":"#pl atm"
			},{
				"content_type":"text",
				"title":"shopping mall",
				"payload":"#pl shopping_mall"
			},{
				"content_type":"text",
				"title":"Hotels & lodging",
				"payload":"#pl lodging"
			},{
				"content_type":"text",
				"title":"Bus station",
				"payload":"#pl bus_station"
			}]
		console.log(location[senderID.toString()])
		sendQuick(senderID,"looking at..",data)	
	}
	else{
		request({
		  url:"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+coord+"&radius=1000&type="+query+"&key=AIzaSyCsojMsfWiHhc4RwlXmfGBbNy747m5oAk8",
		  json:true
		}, function(error, res, body){
			   if(!error){
				   	var data = []
					var i = 0
					body.results.forEach(function(elem){
						console.log(elem.photos)
						if(i<10){
							data.push({
									"title":elem.name,
									"image_url":imgBaseURL+elem.photos[0].photo_reference,
							})
							i++
						}    	
				    	})
				   	var attach = {
						"type":"template",
						"payload":{
							"template_type":"generic",
							"elements":data
						}
					}
					sendAttachment(senderID,data)
			   }//error
			   else
			   console.log(error)
		  })
	}
}
function weather(senderID,text){
text = text.replace("weather in ","")
request({
    url:"http://api.openweathermap.org/data/2.5/weather?q="+text+"&units=metric&appid=93e0f7faf62f96d54eb1d5caa28ed417",
    json:true
  }, function(error, res, body)
          {console.log(city)
           if(!error)
           {
		    if(body!= null){
			    console.log("Into body")
			    if(body.weather !=null){
				    console.log("Into body.weather")
				    if(body.weather[0].description!=null){
						var weather= "Today, in " +body.name+ " we have " +body.weather[0].description+ " and the temperature is " +body.main.temp+" °C"
						attach ={
					      	"type": "template",
					      	"payload": {
					      	"template_type":"generic",
						"elements":[
						 	{
						    		"title":"Weather in "+body.name,
						    		"image_url":"http://www.omgubuntu.co.uk/wp-content/uploads/2013/12/Flat-Weather-Icon-Set.png",
						    		"subtitle":weather
						   	}//element
						   ]//element
					      	}//payload
					      }//attach
					    sendAttachment(senderID,attach)
					}
			    }
		    }
           }//error
           else
           console.log(error)
  }
         )
}
function news(senderID){
	request({
	    url:"https://newsapi.org/v1/articles?source=the-hindu&sortBy=top&apiKey=c0f1536a991945e8b0b19908517d7c72",
	    json:true
	  }, function(error, res, body){  
		   if(!error){
				if(body!= null){
					var inko = []
					var i=0;
					body.articles.forEach ( function(ink) {
					if(i<10){
						inko.push({
								"title":ink.title,
								"image_url":ink.urlToImage,
								"subtitle":ink.description,
								"default_action": {
									"type": "web_url",
									"url":ink.url,
								}
						})
						i++
					}
					})
					var attach = {
						"type":"template",
						"payload":{
							"template_type":"generic",
							"elements":inko
						}
					}
					sendAttachment(senderID,attach)
			    	}
		   }//error
	  })
}
function cricket(senderID){
	var isIpl = false
	request({
    	headers: {
		"apikey": "RqykOVNrgVUMeZye189OQ3SaB7k1 "
    	},
   	uri: "http://cricapi.com/api/matches",
   	}, function (err, res, body) {
	if(!err){
	var arr = []
	result=JSON.parse(body)
	result.matches.forEach(function(match){
		teams.forEach(function(team){
			if(match.squad&&match.matchStarted&&match["team-1"].includes(team)){
				score(senderID,match["unique_id"])
				isIpl = true
			}
		})
		if(match.squad&&match.matchStarted&&!isIpl){
			arr.push({
			"content_type":"text",
			"title":match["team-1"]+" vs "+match["team-2"],
			"payload":"#scores "+match["unique_id"]
			})		
		}
	})
	if(!isIpl){
		title = "No IPL or Indian matches going on currently."	
		sendQuick(senderID,title,arr)
	}
	}
	})
}
function score(senderID,id){
	console.log(id)
	request({
    	headers: {
		"apikey" : "RqykOVNrgVUMeZye189OQ3SaB7k1",
	},
   	url: " http://cricapi.com/api/cricketScore?unique_id="+id,
   	}, function (err, res, body) {
		if(!err){
			result = JSON.parse(body)
			console.log(result["score"])
			sendTextMessage(senderID,result["innings-requirement"])
			if(result["score"]!=null)
				sendTextMessage(senderID,result["score"])
		}
		else
			console.log("nope")
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
	//console.log(array)
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
function threadSetUp(messageData){
request({
	uri: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+access_token,
    	method: 'POST',
    	json: messageData
	
},function (error,response,body){
	if(!error){
		console.log("set up complete "+JSON.stringify(body));	
	}	
});
}
function getFirstName(senderID){
	var first_name
	request({
		uri: 'https://graph.facebook.com/v2.6/'+senderID +'?fields=first_name&access_token='+access_token,
		method: 'GET',	
	},function (error,response,body){
		if(!error){
			console.log(body)
			first_name = body.first_name
		}	
	});
	return first_name
}
app.listen(port);
