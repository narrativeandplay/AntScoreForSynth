define(
	["comm"],
	function (comm) {
      // argurments are <textareas>
      return function (i_publicTB, i_awarenessTB, i_offerTB, i_intentTB, i_name, i_colour, i_voice, time_cb, currentURL){

      	const DISABLED = 0;
      	const AWARENESS = 1;
      	const OFFER = 2;
      	const INTENT = 3;

    	var chatter={};

    	var condition = currentURL.query.condition;
		console.log("condition:" + condition);
    	var participant = currentURL.query.participant;
		console.log("participant:" + participant);

    	var publicTB = i_publicTB;
    	var awarenessTB = i_awarenessTB;
    	var offerTB = i_offerTB;
    	var intentTB = i_intentTB;
    	var myName = i_name;
    	var myColour = i_colour;
    	var myVoice = i_voice;

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
				comm.sendJSONmsg("chat", {"text": msg, "time": time_cb(), "texttype": texttype});
				chatter.sayOffer(msg, myName, myColour, myVoice, texttype, true);
				thisTB.value="";
			}
		}

		if(awarenessTB){
			if(participant==1){
				awarenessTB.disabled = false;
				currentState = AWARENESS;
			}
			awarenessTB.onkeyup = function(evt){
				keyupHandler(evt, awarenessTB, AWARENESS);
			}
	    }
	    if(offerTB){
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

        // add distinguishing of text type (awareness, offer or intent)
        chatter.sayOffer = function(iText, iName, iColor, iVoice, iTexttype, iLocal) {
            var thespan = document.createElement("span");
            thespan.style.color=iColor;
            switch(iTexttype){
            	case AWARENESS:
            		if(iLocal) {
	            		var indentItalics = document.createElement("em");
			            thespan.appendChild(indentItalics);
			            indentItalics.appendChild(document.createTextNode(iName + ": "))
			            indentItalics.appendChild(document.createTextNode("< "+iText+">"));
			            thespan.appendChild(document.createElement("br"));
			            currentState=OFFER;
			            awarenessTB.disabled=true;
			            offerTB.disabled=false;
			            offerTB.focus();
            		}
            		break;
            	case OFFER:
		            thespan.appendChild(document.createTextNode(iName + ": "))
		            thespan.appendChild(document.createTextNode(iText))
		            thespan.appendChild(document.createElement("br"));
		            if(condition==1){
				        if(iLocal){
		        			currentState=DISABLED;
		        			offerTB.disabled=true;
				        } else {
		        			currentState=AWARENESS;
		        			awarenessTB.disabled=false;
		        			awarenessTB.focus();
				        }
		            } else {
			            if(iLocal) {
				            currentState=INTENT;
				            offerTB.disabled=true;
				            intentTB.disabled=false;
				            intentTB.focus();
			            }
			        }
            		break;
            	case INTENT:
            		if(iLocal || condition==3) {
	            		var indentItalics = document.createElement("em");
			            thespan.appendChild(indentItalics);
			            indentItalics.appendChild(document.createTextNode(iName + ": "))
			            indentItalics.appendChild(document.createTextNode("[ "+iText+"]"));
			            thespan.appendChild(document.createElement("br"));
			        }
			        if(iLocal){
	        			currentState=DISABLED;
	        			intentTB.disabled=true;
			        } else {
	        			currentState=AWARENESS;
	        			awarenessTB.disabled=false;
	        			awarenessTB.focus();
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

        return chatter;
    }
});






