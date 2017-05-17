define(
	["comm"],
	function (comm) {
      // argurments are <textareas>
      return function (i_publicTB, i_awarenessTB, i_offerTB, i_intentTB, i_name, i_colour, i_voice, time_cb){

    	var chatter={};

    	var publicTB = i_publicTB;
    	var awarenessTB = i_awarenessTB;
    	var offerTB = i_offerTB;
    	var intentTB = i_intentTB;
    	var myName = i_name;
    	var myColour = i_colour;
    	var myVoice = i_voice;

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

		keyupHandler = function(evt, thisTB){
			var chrTyped, chrCode = 0;
			var msg;
			console.log("in onkeyup,  my chat text = " + thisTB.value +","+evt.key);
			if (evt.key==="Enter") {
				console.log("****");
				msg=thisTB.value.slice(thisTB.prompt.length);
				comm.sendJSONmsg("chat", {"text": msg, "time": time_cb()});
				chatter.sayOffer(msg, myName, myColour, myVoice);
				thisTB.value=thisTB.prompt;
			}
		}

		if(awarenessTB){
	    	awarenessTB.prompt="awareness: ";
	    	awarenessTB.value=awarenessTB.prompt;

			awarenessTB.onkeyup = function(evt){
				keyupHandler(evt, awarenessTB);
			}
	    }
	    if(offerTB){
	    	offerTB.prompt="offer: ";
	    	offerTB.value=offerTB.prompt;

			offerTB.onkeyup = function(evt){
				keyupHandler(evt, offerTB);
			}
	    }
	    if(intentTB){
	    	intentTB.prompt="intent: ";
	    	intentTB.value=intentTB.prompt;

			intentTB.onkeyup = function(evt){
				keyupHandler(evt, intentTB);
			}
	    }


        chatter.setText=function(id, iText, t){
        	publicTB.value += id + (t? " @ " + Math.floor(t/100)/10 : "") + "> " + iText;
        	publicTB.scrollTop = publicTB.scrollHeight;
        }

        chatter.sayOffer = function(iText, iName, iColor, iVoice) {
            var thespan = document.createElement("span");
            thespan.style.color=iColor;
            thespan.appendChild(document.createTextNode(iName + ": " + iText))
            thespan.appendChild(document.createElement("br"));
            theScript.appendChild(thespan);
            theScript.scrollTop = theScript.scrollHeight;
            
            if(toggleSoundButton.state===true ) {
              if ('speechSynthesis' in window) {
                var spokenText = iText.replace(/\[\b[^\[]*\]/gi, "");
                console.log("Saying: " + spokenText);
                var msg = new SpeechSynthesisUtterance(spokenText);
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






