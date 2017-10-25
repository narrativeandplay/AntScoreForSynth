define(
	["comm"],
	function (comm) {
      // argurments are <textareas>
      return function (i_publicTB, i_offerTB, i_intentTB, i_name, i_colour, i_voice, time_cb, currentURL){

      	const DISABLED = 0;
      	const OFFER = 2;
      	const INTENT = 3;

    	var chatter={};

    	var condition = currentURL.query.condition; // experimental condition (1=no intent, 2=local only, 3=both)
		console.log("condition:" + condition);
    	var participant = currentURL.query.participant; // participant number (1 or 2)
    	chatter.participant=participant;
		console.log("participant:" + participant);
    	var isVerbal = currentURL.query.verbal; // is intent sent verbally?
		console.log("isVerbal:" + isVerbal);
    	var turnTaking = currentURL.query.turntaking; // turn taking: true => strict turn taking
		console.log("turnTaking:" + turnTaking);
    	var optionalIntent = currentURL.query.optionalintent; // optional intent: true => can be blank/skipped
		console.log("optionalIntent:" + optionalIntent);
        var sendImmediately = currentURL.query.sendimmediately; // should changes by sent on keystroke (for awareness)?
		console.log("sendImmediately:" + sendImmediately);
		var hideName = currentURL.query.hidename; // should name be shown in script?
		console.log("hideName:" + hideName);
		var showBoth = currentURL.query.showboth; // should offer and intent fields both be shown at the same time?
		console.log("showBoth:" + showBoth);
		var hasCubes = false; // are we using storycubes? (set in code below)

    	var publicTB = i_publicTB;
    	var offerTB = i_offerTB;
    	var intentTB = i_intentTB;
    	var intentHeader = document.getElementById("intentHeader");
    	var remoteTB = document.getElementById("remoteDisplay");
    	var remoteHeader = document.getElementById("remoteHeader");
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
					offerTB.focus();
				}
			}
		}

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
    		if(hasCubes) {
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
	    }

		// remember the chat area (the "script") and sound state button
		var theScript = document.getElementById("publicChatArea");
		var theScriptParent = document.getElementById("block4c2")
		var toggleSoundButton = document.getElementById("soundToggleButton");

		keyupHandler = function(evt, thisTB, texttype){
			var chrTyped, chrCode = 0;
			var msg;
			console.log("in onkeyup,  my chat text = " + thisTB.value +","+evt.key);
			if (evt.key==="Enter" && (thisTB.value != ""||optionalIntent)) {
				console.log("****");
				msg=thisTB.value;
				//comm.sendJSONmsg("chat", {"text": msg, "time": time_cb(), "texttype": texttype});
				chatter.sayOffer(msg, myName, myColour, myVoice, texttype, selectedCubeId, selectedCubeValue, true);
				thisTB.value="";
				blankCube();
			} else if (evt.key!="Enter" && thisTB===offerTB && sendImmediately) {
				msg=thisTB.value;
				comm.sendJSONmsg("istyping", {"text": msg, "time": time_cb()});				
			}
		}

	    if(remoteTB){
			if(sendImmediately) {
				console.log("!!!!!!!")
				remoteTB.hidden=false;
			}
	    }

	    // set up offer textbox
	    if(offerTB){
	    	if(hasCubes) {
	    		offerTB.style.width="90%"; // fix the width so cubes fit nicely on the same line
	    	}
			if(participant==1 || !turnTaking){
				// either we're participant 1 or there's no turn taking, so show offer textbox
				offerTB.disabled = false;
			} else {
				disableCube(true);
			}
			offerTB.onkeydown = function(evt){
				if (evt.key==="Enter") {
					evt.preventDefault();
				}
			}
			offerTB.onkeyup = function(evt){
				if (!hasCubes || selectedCube!=null) {
					keyupHandler(evt, offerTB, OFFER);
				}
			}
	    }

	    // set up intent textbox
	    if(intentTB){
			if(condition==1) {
				// if we're running condition 1, then there's no intent textbox
				intentTB.style.visibility="hidden";
				document.getElementById("intentHeader").style.visibility="hidden";
			}
			if(showBoth) {
				// if showing both, then enable the intent textbox
				intentTB.disabled = false;
				intentTB.hidden = false;
    			intentHeader.hidden=false;
			}
			intentTB.onkeyup = function(evt){
				keyupHandler(evt, intentTB, INTENT);
			}
			intentTB.onkeydown = function(evt){
				if (evt.key==="Enter") {
					evt.preventDefault();
				}
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
			if(hasCubes) {
				cubeMenu.src="images/cubes/cube0.jpg";
				cubeMenuDisabled.src="images/cubes/cube0.jpg";
			}
		}

		function clearSelection() {
	    	selectedCube=null;
	    	selectedCubeId="";
	    	selectedCubeValue=0;
		}

		// remote display
		var lastTypedTime = 0;
		var showingTyping = false;
		chatter.showRemoteStatus = function(iText, iName, iColor, iVoice) {
			if(remoteTB) {
				remoteTB.value = iName + " is typing...";
			}
			lastTypedTime = time_cb();
			showingTyping = true;
		}
		chatter.updateRemoteStatus = function() {
			if(showingTyping && time_cb()-lastTypedTime>1000) {
				if(remoteTB) {
					remoteTB.value = "";
				}
				showingTyping = false;
			}
		}

		// prompts - eventually load from JSON, cheat for now
		var prompts = [ "You set down the weight from your shoulders, shrugging off the aches from this load you've been carrying for so long. (What is this load?)",
						"An echoing aftertaste of the last thing you've drank or eaten flickers across your tongue. (What is it? Do you enjoy / dislike this taste?)", 
						"Yikes! There's something stuck in your footwear. (What footwear are you wearing? What is stuck in your footwear?)",
						"There! Finally. The building ahead - a dozen paces more, and you'll be there! (Where are you going? How are you feeling now?)",
						"You shake your head slowly, a little dazed, and realize you've been staring at your reflection for a while now. (What is the reflective surface?)",
						"Your pockets feel a little lighter than they should be! You realize something's fallen out... (What was it? Was it important? Where might it be?)",
						"Your nostrils picks up a faint, yet sharp scent. You recognize this scent... (What is it? Where do you recognize this from?)",
						"Ah, something's caught in your clothing. You might have brushed against this earlier on your journey... (What is it? Where did you encounter it?)",
						"For a brief moment, you thought you heard a voice of somebody important to you. But that's not possible, because... (Why is this impossible?)",
						"Careful now! You stagger back, nearly falling, but catch yourself in time. (What has staggered you so?)",
						"The people in uniform - they won't let you pass, no matter how much you threaten or beg. (What is this place? Where are you trying to go?)", 
						"You feel reassured by that comfortable presence, so close to you. (What is this thing that comforts you? A tool? A living creature?)"];
		chatter.showPrompt = function() {
			chatter.sayOffer(prompts[Math.floor(Math.random() * 12)], myName, myColour, myVoice, 3, false, false, false);
		}

        // add distinguishing of text type (awareness, offer or intent)
        chatter.sayOffer = function(iText, iName, iColor, iVoice, iTexttype, iSelectedCube, iSelectedCubeValue, iLocal) {
            var thespan = document.createElement("span");
            thespan.style.color=iColor;
            switch(iTexttype){
            	case OFFER:
		            if(!hideName) {
		            	thespan.appendChild(document.createTextNode(iName + ": "));
		            }
		            if(hasCubes) {
			            var theImage = document.createElement("IMG");
			            theImage.src="images/cubes/"+iSelectedCube+"-"+iSelectedCubeValue+".jpg";
			            theImage.border=1;
			            theImage.width=30;
			            theImage.height=30;
			            thespan.appendChild(theImage);
			            thespan.appendChild(document.createTextNode(" "))
			        }
		            thespan.appendChild(document.createTextNode(iText))
		            thespan.appendChild(document.createElement("br"));
        			hideCube(iSelectedCube);
        			if(!iLocal && sendImmediately) {
			            remoteTB.value="";
						showingTyping = false;
        			}
		            if(condition==1){
		            	// in condition 1, if turntaking then toggle between offer and disabled
				        if(iLocal){
		        			if(turnTaking) {
		        				disableCube(true);
			        			offerTB.disabled=true;
		        			}
		        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": OFFER, "selectedCube": iSelectedCube, "selectedCubeValue": iSelectedCubeValue});
	        				clearSelection();
				        } else {
				        	if(turnTaking) {
	        					disableCube(false);
			        			offerTB.disabled=false;
			        			offerTB.focus();
			        		}
				        }
		            } else {
		            	// otherwise, ask for intent after offer is entered
			            if(iLocal) {
			            	if(showBoth) {
			            		// showing both, so send right away and don't change to intent
			        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": OFFER, "selectedCube": iSelectedCube, "selectedCubeValue": iSelectedCubeValue});
		        				clearSelection();
			            	} else {
			            		// otherwise store offer and change to intent
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
			        }
            		break;
            	case INTENT:
            		if((iLocal && condition==2) || condition==3) {
            			// if local and condition 2, or condition 3, then show the intent
            			if(iText!="") {
		            		var indentItalics = document.createElement("em");
				            thespan.appendChild(indentItalics);
				            if(!hideName) {
					            indentItalics.appendChild(document.createTextNode(iName + ": "));
					        }
				            if(!isVerbal) {
					            indentItalics.appendChild(document.createTextNode("["+iText+"]"));
					            thespan.appendChild(document.createElement("br"));
					        }
					    }
			        }
			        if(iLocal){
			        	// if local, send the offer and intent, and pass control to remote if turn taking
		        		if(!showBoth) {
				        	if(!turnTaking) {
		        				disableCube(false);
			        			offerTB.disabled=false;
			        			offerTB.focus();
			        		}
		        			intentTB.disabled=true;
		        			intentTB.hidden=true;
		        			intentHeader.hidden=true;
		        			comm.sendJSONmsg("chat", {"text": this.pendingOffer, "time": time_cb(), "texttype": OFFER, "selectedCube": iSelectedCube, "selectedCubeValue": iSelectedCubeValue});
		        		}
	        			comm.sendJSONmsg("chat", {"text": iText, "time": time_cb(), "texttype": INTENT});
	        			clearSelection();
			        } else {
			        	// otherwise, we now have control, so switch to offer
			        	if(turnTaking) {
	        				disableCube(false);
		        			offerTB.disabled=false;
		        			offerTB.focus();
		        		}
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
			intentTB.disabled=true;
			intentHeader.hidden=true;
			comm.sendJSONmsg("chat", {"text": this.pendingOffer, "time": time_cb(), "texttype": OFFER, "selectedCube": selectedCubeId, "selectedCubeValue": selectedCubeValue});
			var blob = new Blob(i_recordedBlobs, {type: 'video/webm'});
			comm.sendBlob("intent", blob);
			// should there be a local record of intent?
			// this.sayIntent(blob, null, null, null, true);
			comm.sendJSONmsg("chat", {"text": "intent sent as audio", "time": time_cb(), "texttype": INTENT});
			clearSelection();
          }

        return chatter;
    }
});






