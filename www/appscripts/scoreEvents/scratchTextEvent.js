define(
	["scoreEvents/genericScoreEvent"],
	function (generalScoreEvent) {

      // argument is used to determine if the textEvent is in the public or private scratch space
      return function (in_isPublic, i_arg){
        var sendImmediately = true;
        var isPublic = in_isPublic;

         var textBox=document.createElement("input");
         textBox.className="textBox1"
         var scoreElmt;
         if(isPublic) {
           scoreElmt=document.getElementById("block3d");
         } else {
           scoreElmt=document.getElementById("block3e");
         }

        textBox.readOnly = true; // by default - change manually if its our own 

         console.log("appending textBox");
         scoreElmt.appendChild(textBox);
         textBox.focus();

        // drag and drop
        textBox.draggable=true;
        textBox.ondragstart=function(ev) {
          ev.dataTransfer.setData("textbox", this);
          console.log("ondragstart") 
        }

        // on drop: 

/*
        scoreElmt.ondrop=function(ev) {
          ev.preventDefault();
          var data = ev.dataTransfer.getData("textbox");
          ev.target.appendChild(data);
          console.log("ondrop: "+data) 
        }
        scoreElmt.ondragover=function(ev) {
            ev.preventDefault();
        }
*/

         var m_scoreEvent=generalScoreEvent("scratchTextEvent");
         m_scoreEvent.head="text";
         m_scoreEvent.tail=false;

         m_scoreEvent.text= i_arg || "";

         m_textHeight=12;

         textBox.style.fontSize="18pt";

        m_scoreEvent.enableEditing= function(){
          textBox.readOnly = false;
          textBox.style.border="2px solid #d9d9d9";
        }

        m_scoreEvent.disableEditing= function(){
          textBox.readOnly = true;
          textBox.style.border="2px solid d9d9d9";
          textBox.style.background="#f0f0f0";
        }

        m_scoreEvent.setText=function(id, iText){
          //m_scoreEvent.text=id + "> " + iText;
          m_scoreEvent.text=iText;
          //textBox.value= id + "> " + iText;
          textBox.value= iText;
          console.log("id is " + id + ", and .s is " + m_scoreEvent.s + ": " + iText);
        }

        var deleteFlag;
        var destroyed = false;

        // hack to catch delete key without a backspace
        textBox.onkeydown=function(evt){
          var charCode = (evt.which) ? evt.which : event.keyCode;
          console.log("in onkeydown, on keypress m_scoreEvent.text = " + m_scoreEvent.text + ", key=" + evt.keyIdentifier);
          if (charCode==8 && textBox.value.length==0) {
            //console.log("now we should delete*******");
            deleteFlag=true;
          } else {
            deleteFlag=false;
          }
        }

         textBox.onkeyup=function(evt){
          var chrTyped = 0;
          var charCode = (evt.which) ? evt.which : event.keyCode;
          m_scoreEvent.text=textBox.value;
          console.log("in onkeyup, on keypress m_scoreEvent.text = " + m_scoreEvent.text + ", key=" + evt.keyIdentifier);
          if (deleteFlag===true) {
            // really delete
            //console.log("delete*******");
            m_scoreEvent.comm.sendJSONmsg("delete", {"gID": m_scoreEvent.gID, "text": m_scoreEvent.text});
            m_scoreEvent.destroy();
            destroyed=true;
          } else {
            if(sendImmediately||evt.keyIdentifier==="Enter") {
              m_scoreEvent.comm.sendJSONmsg("update", {"gID": m_scoreEvent.gID, "text": m_scoreEvent.text});
            }
          }
         }
         

         m_scoreEvent.myDraw = function(ctx, x, y){

                var seRect = scoreElmt.getBoundingClientRect();
                var tbRect = textBox.getBoundingClientRect();

                textBox.style.top=scoreElmt.offsetTop + scoreElmt.clientHeight*y/ctx.canvas.height+"px";
                textBox.style.left=scoreElmt.offsetLeft+ scoreElmt.clientWidth*x/ctx.canvas.width+"px";
                textBox.size=Math.max(3, textBox.value.length);
                textBox.style.clip = "rect(0px " + 
                  (tbRect.width+seRect.right-tbRect.right) + "px " +  
                  (tbRect.height+seRect.bottom-tbRect.bottom) +  "px " + 
                  (seRect.left-tbRect.left)  + "px)"; //scoreElmt.getBoundingClientRect();
                console.log("myDraw: textBox.style.top: "+textBox.style.top+", "+
                  "textBox.style.left: "+textBox.style.left+", "+
                  "textBox.size: "+textBox.size+", "+
                  "textBox.style.clip: "+textBox.style.clip)
                window.scrollTo(0,0);
         }

         m_scoreEvent.destroy = function(){
          if (!destroyed) {
            scoreElmt.removeChild(textBox);
          }
         }

         m_scoreEvent.touchedP = function(t,y){
            var tempy;

            if ((this.b <= t) && (this.e >= t) && (y > this.d[0][1]) &&  (y <  this.d[0][1]+m_textHeight)){
               console.log("SELECTED TEXT");
               this.selectedP=true;
            }
            else{
               this.selectedP=false;
            }
            return  this.selectedP; 
         }; // touchedP

         m_scoreEvent.getKeyFields= function(arg){
               return {
                  "text": m_scoreEvent.text
               }
            }

         return m_scoreEvent;
      }
});