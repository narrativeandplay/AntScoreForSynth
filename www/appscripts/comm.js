define(
	[],
	function () {

		var host = document.location.host;
		var ws = new WebSocket('wss://' + host);

		console.log("host is " + host);

		//List of messages we can handle from the server (and other clients via the server)
		var callbacks = {};
		var registerCallback = function (name, callback) {
			callbacks[name] = callback;
		};


		ws.addEventListener('message', function(e){receiveJSONmsg.call(ws, e.data)});

		var receiveJSONmsg = function (data, flags) {
			var obj;
			try {
				obj = JSON.parse(data);
			} catch (e) {
				// verbal only - hack to receive blob
				callbacks['intent'].call(this, data, 0);
				return;
			}
			//console.log("received message ",  obj);
			// All messages should have 
			//	.n - name of method to call (this is the "message"),
			//	.d - the data payload (methods must know the data they exepct)
			//	.s - an id of the remote client sending the message

			if (!obj.hasOwnProperty('d') || !obj.hasOwnProperty('n') || callbacks[obj.n] === undefined)
				return;
			callbacks[obj.n].call(this, obj.d, obj.s);
		}

		// For sending local client events to the server
		var sendJSONmsg = function (name, data) {
			ws.send(JSON.stringify({n: name, d: data}));//, {mask: true});
		};

		// verbal only - hack to send blob
		var sendBlob = function(name, data) {
			var myReader = new FileReader();
			myReader.readAsArrayBuffer(data)

			myReader.addEventListener("loadend", function(e)
			{
				var buffer = e.srcElement.result;//arraybuffer object
				ws.send(buffer);
			});
		}


		return { 
			host: host,
			registerCallback: registerCallback,
			sendJSONmsg: sendJSONmsg,
			sendBlob: sendBlob
		};
	}
);


