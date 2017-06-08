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
    	chatter.participant=participant;
		console.log("participant:" + participant);
    	var isVerbal = currentURL.query.verbal;
		console.log("isVerbal:" + isVerbal);
		var hasCubes = false;

    	var publicTB = i_publicTB;
    	var offerTB = i_offerTB;
    	var intentTB = i_intentTB;
    	var intentHeader = document.getElementById("intentHeader");
    	var myName = i_name;
    	var myColour = i_colour;
    	var myVoice = i_voice;

    	//var isVerbal = (document.querySelector('audio#gum')!=null);

    	// cubes 
    	var selectedCube=null;
    	var selectedCubeId="";
    	var selectedCubeValue=0;
		var cubeMenu = document.getElementById("cubeMenu");
		var cubeMenuDisabled = document.getElementById("disabledDropdown");
		var cubeValues = [];
		if(cubeMenu) {
			hasCubes=true;
			for (i=1; i<10; i++) {
				var thisCube = document.getElementById("cube"+i);
				var thisCubeValue=Math.floor((Math.random() * 6) + 1);
				cubeValues[i]=thisCubeValue;
				thisCube.firstChild.src="images/cubes/cube"+i+"-"+thisCubeValue+".jpg";
				thisCube.firstChild.cubeValue=thisCubeValue; // store the value on the element
				thisCube.onclick=function(e) {
					console.log("clicked cube " + e.currentTarget.id);
					if(selectedCube!=null) 
						selectedCube.border=0;
					selectedCube=e.target;
					selectedCube.border=1;
					selectedCubeId=e.currentTarget.id;
					selectedCubeValue=selectedCube.cubeValue;
					cubeMenu.src=selectedCube.src;
					cubeMenuDisabled.src=selectedCube.src;
				}
			}
		}

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

    	chatter.getCubeValues=function() {
    		return {"one": cubeValues[1],
					 "two": cubeValues[2], 
					 "three": cubeValues[3], 
					 "four": cubeValues[4], 
					 "five": cubeValues[5], 
					 "six": cubeValues[6], 
					 "seven": cubeValues[7], 
					 "eight": cubeValues[8], 
					 "nine": cubeValues[9]};

    	}

    	chatter.setCubeValues=function(inData) {
    		console.log("setCubeValues");
    		cubeValues[1]=inData.one;
    		cubeValues[2]=inData.two;
    		cubeValues[3]=inData.three;
    		cubeValues[4]=inData.four;
    		cubeValues[5]=inData.five;
    		cubeValues[6]=inData.six;
    		cubeValues[7]=inData.seven;
    		cubeValues[8]=inData.eight;
    		cubeValues[9]=inData.nine;
    		for(i=1;i<10;i++){
				var thisCube = document.getElementById("cube"+i);
				thisCube.firstChild.src="images/cubes/cube"+i+"-"+cubeValues[i]+".jpg";
				thisCube.firstChild.cubeValue=cubeValues[i]; // store the value on the element
    		}
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
				chatter.sayOffer(msg, myName, myColour, myVoice, texttype, selectedCubeId, selectedCubeValue, true);
				thisTB.value="";
			}
		}

	    if(offerTB){
			if(participant==1){
				offerTB.disabled = false;
				currentState = OFFER;
			} else {
				disableCube(true);
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

		function hideCube(iSelectedCube) {
			if(hasCubes){
				var thisCube = document.getElementById(iSelectedCube);
				thisCube.hidden=true;
			}
		}

		function disableCube(inDisable) {
			if(hasCubes) {
				if(inDisable) {
					cubeMenu.hidden=true;
					cubeMenuDisabled.style.display="initial";
				} else {
					cubeMenu.hidden=false;
					cubeMenuDisabled.style.display="none";
				}
			}
		}

		function blankCube() {
			if(hasCubes)
				cubeMenu.src="images/cubes/cube0.jpg";
				cubeMenuDisabled.src="images/cubes/cube0.jpg";
		}

        // add distinguishing of text type (awareness, offer or intent)
        chatter.sayOffer = function(iText, iName, iColor, iVoice, iTexttype, iSelectedCube, iSelectedCubeValue, iLocal) {
            var thespan = document.createElement("span");
            thespan.style.color=iColor;
            switch(iTexttype){
            	case OFFER:
		            thespan.appendChild(document.createTextNode(iName + ": "));
		            var theImage = document.createElement("IMG");
		            theImage.src="images/cubes/"+iSelectedCube+"-"+iSelectedCubeValue+".jpg";
		            theImage.border=1;
		            theImage.width=30;
		            theImage.height=30;
		            thespan.appendChild(theImage);
		            thespan.appendChild(document.createTextNode(" "+iText))
		            thespan.appendChild(document.createElement("br"));
        			hideCube(iSelectedCube);
		            if(condition==1){
		            	// in condition 1, just toggle between offer and disabled
				        if(iLocal){
		        			currentState=DISABLED;
	        				disableCube(true);
	        				blankCube();
		        			offerTB.disabled=true;
		        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": OFFER, "selectedCube": iSelectedCube, "selectedCubeValue": iSelectedCubeValue});
				        } else {
		        			currentState=OFFER;
        					disableCube(false);
		        			offerTB.disabled=false;
		        			offerTB.focus();
				        }
		            } else {
		            	// otherwise, ask for intent after offer is entered
			            if(iLocal) {
				            currentState=INTENT;
	        				disableCube(true);
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
            			// if not local and condition 3, then show the intent
	            		var indentItalics = document.createElement("em");
			            thespan.appendChild(indentItalics);
			            indentItalics.appendChild(document.createTextNode(iName + ": "))
			            if(!isVerbal) {
				            indentItalics.appendChild(document.createTextNode("[ "+iText+"]"));
				            thespan.appendChild(document.createElement("br"));
				        }
			        }
			        if(iLocal){
			        	// if local, send the offer and intent and pass control to remote
	        			currentState=DISABLED;
	        			blankCube();
	        			intentTB.disabled=true;
	        			intentTB.hidden=true;
	        			intentHeader.hidden=true;
	        			comm.sendJSONmsg("chat", {"text": this.pendingOffer, "time": time_cb(), "texttype": OFFER, "selectedCube": iSelectedCube, "selectedCubeValue": iSelectedCubeValue});
	        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": INTENT});
			        } else {
			        	// otherwise, we now have control, so switch to offer
	        			currentState=OFFER;
        				disableCube(false);
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
			blankCube();
			intentTB.disabled=true;
			intentHeader.hidden=true;
			comm.sendJSONmsg("chat", {"text": this.pendingOffer, "time": time_cb(), "texttype": OFFER, "selectedCube": selectedCubeId, "selectedCubeValue": iSelectedCubeValue});
			var blob = new Blob(i_recordedBlobs, {type: 'video/webm'});
			comm.sendBlob("intent", blob);
			// should there be a local record of intent?
			// this.sayIntent(blob, null, null, null, true);
			comm.sendJSONmsg("chat", {"text": "intent sent as audio", "time": time_cb(), "texttype": INTENT});
          }

        return chatter;
    }
});






