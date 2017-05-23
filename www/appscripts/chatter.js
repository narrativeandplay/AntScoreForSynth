define(
	["comm"],
	function (comm) {
      // argurments are <textareas>
      return function (i_publicTB, i_offerTB, i_intentTB, i_name, i_colour, i_voice, time_cb, currentURL){

      	const DISABLED = 0;
      	const OFFER = 2;
      	const INTENT = 3;

    	var chatter={};

    	var condition = currentURL.query.condition;
		console.log("condition:" + condition);
    	var participant = currentURL.query.participant;
		console.log("participant:" + participant);
    	var isVerbal = currentURL.query.verbal;
		console.log("isVerbal:" + isVerbal);

    	var publicTB = i_publicTB;
    	var offerTB = i_offerTB;
    	var intentTB = i_intentTB;
    	var intentHeader = document.getElementById("intentHeader");
    	var myName = i_name;
    	var myColour = i_colour;
    	var myVoice = i_voice;

    	//var isVerbal = (document.querySelector('audio#gum')!=null);

    	var currentState = DISABLED;

    	chatter.setName=function(iName) {
    		myName = iName;
    	}

    	chatter.setVoice=function(iVoice) {
    		myVoice = iVoice;
    	}

    	chatter.setColour=function(iColour) {
    		myColour = iColour;
    	}

		// remember the chat area (the "script") and sound state button
		var theScript = document.getElementById("publicChatArea");
		var theScriptParent = document.getElementById("block4c2")
		var toggleSoundButton = document.getElementById("soundToggleButton");

		keyupHandler = function(evt, thisTB, texttype){
			var chrTyped, chrCode = 0;
			var msg;
			console.log("in onkeyup,  my chat text = " + thisTB.value +","+evt.key);
			if (evt.key==="Enter") {
				console.log("****");
				msg=thisTB.value;
				//comm.sendJSONmsg("chat", {"text": msg, "time": time_cb(), "texttype": texttype});
				chatter.sayOffer(msg, myName, myColour, myVoice, texttype, true);
				thisTB.value="";
			}
		}

	    if(offerTB){
			if(participant==1){
				offerTB.disabled = false;
				currentState = OFFER;
			}
			offerTB.onkeyup = function(evt){
				keyupHandler(evt, offerTB, OFFER);
			}
	    }
	    if(intentTB){
			if(condition==1) {
				intentTB.style.visibility="hidden";
				document.getElementById("intentHeader").style.visibility="hidden";
			}
			intentTB.onkeyup = function(evt){
				keyupHandler(evt, intentTB, INTENT);
			}
	    }


        chatter.setText=function(id, iText, t){
        	publicTB.value += id + (t? " @ " + Math.floor(t/100)/10 : "") + "> " + iText;
        	publicTB.scrollTop = publicTB.scrollHeight;
        }

		chatter.pendingOffer = ""; // store the offer until the intent is entered

        // add distinguishing of text type (awareness, offer or intent)
        chatter.sayOffer = function(iText, iName, iColor, iVoice, iTexttype, iLocal) {
            var thespan = document.createElement("span");
            thespan.style.color=iColor;
            switch(iTexttype){
            	case OFFER:
		            thespan.appendChild(document.createTextNode(iName + ": "))
		            thespan.appendChild(document.createTextNode(iText))
		            thespan.appendChild(document.createElement("br"));
		            if(condition==1){
				        if(iLocal){
		        			currentState=DISABLED;
		        			offerTB.disabled=true;
		        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": OFFER});
				        } else {
		        			currentState=OFFER;
		        			offerTB.disabled=false;
		        			offerTB.focus();
				        }
		            } else {
			            if(iLocal) {
				            currentState=INTENT;
				            offerTB.disabled=true;
				            intentTB.disabled=false;
		        			this.pendingOffer=iText;
		        			intentHeader.hidden=false;
		        			// verbal specific stuff
		        			if(isVerbal) {
			        			startRecording();
			        		} else {
			        			intentTB.hidden=false;
					            intentTB.focus();
			        		}
			            }
			        }
            		break;
            	case INTENT:
            		if(!iLocal && condition==3) {
	            		var indentItalics = document.createElement("em");
			            thespan.appendChild(indentItalics);
			            indentItalics.appendChild(document.createTextNode(iName + ": "))
			            if(!isVerbal) {
				            indentItalics.appendChild(document.createTextNode("[ "+iText+"]"));
				            thespan.appendChild(document.createElement("br"));
				        }
			        }
			        if(iLocal){
	        			currentState=DISABLED;
	        			intentTB.disabled=true;
	        			intentTB.hidden=true;
	        			intentHeader.hidden=true;
	        			comm.sendJSONmsg("chat", {"text": this.pendingOffer, "time": time_cb(), "texttype": OFFER});
	        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": INTENT});
			        } else {
	        			currentState=OFFER;
	        			offerTB.disabled=false;
	        			offerTB.focus();
			        }
            		break;
            }
            theScript.appendChild(thespan);
            theScript.scrollTop = theScript.scrollHeight;
            
            if(toggleSoundButton.state===true && iTexttype==OFFER) {
              if ('speechSynthesis' in window) {
                console.log("Saying: " + iText);
                var msg = new SpeechSynthesisUtterance(iText);
                var theVoice = iVoice;
                if (theVoice) { 
                  var availableVoices = speechSynthesis.getVoices();
                  msg.voice = availableVoices.filter(function(thisVoice) { return thisVoice.name === theVoice; })[0]; //voiceSelect.value; })[0];
                  console.log("Speaking with voice " + iVoice);
                }
                window.speechSynthesis.speak(msg);
              }
            }
          }

          // verbal specific
          chatter.sayIntent=function(iBlobs, iName, iColor, iVoice, iLocal) {
          	console.log("Got intent!" + iBlobs);
          	if(condition==3) {
	            var thespan = document.createElement("span");
	            thespan.style.color=iColor;
          		var intentPlayer = document.createElement("audio");
          		intentPlayer.controls=true;
          		intentPlayer.autoplay=true;
          		intentPlayer.loop=false;
          		intentPlayer.style.verticalAlign="text-bottom";
          		thespan.appendChild(intentPlayer);
	            thespan.appendChild(document.createElement("br"));
	            theScript.appendChild(thespan);
	          	playIntent(iBlobs, intentPlayer);
          	}
          }

          // verbal specific
          chatter.endIntent=function(i_recordedBlobs){
			currentState=DISABLED;
			intentTB.disabled=true;
			intentHeader.hidden=true;
			comm.sendJSONmsg("chat", {"text": this.pendingOffer, "time": time_cb(), "texttype": OFFER});
			var blob = new Blob(i_recordedBlobs, {type: 'video/webm'});
			comm.sendBlob("intent", blob);
			// should there be a local record of intent?
			// this.sayIntent(blob, null, null, null, true);
			comm.sendJSONmsg("chat", {"text": "intent sent as audio", "time": time_cb(), "texttype": INTENT});
          }

        return chatter;
    }
});






