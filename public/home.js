function addElement(parentId, elementTag, elementId, html) {
    // Adds an element to the document
    var p = document.getElementById(parentId);
    var newElement = document.createElement(elementTag);
    newElement.setAttribute('id', elementId);
    newElement.innerHTML = html;
    p.appendChild(newElement);
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}
//https://www.abeautifulsite.net/adding-and-removing-elements-on-the-fly-using-javascript

function showTasks(userId, showArchive=false){
  
  for(var i=1; i<=noteId; i++){
    removeElement('note-' + i);
  }
  noteId=0;
  console.log(userId);
  const xmlHttp = new XMLHttpRequest();
  const theUrl = "https://interesting-broadleaf-redcurrant.glitch.me/note?userId="+userId;

  xmlHttp.open("GET", theUrl); 
  xmlHttp.send();
  
  xmlHttp.onreadystatechange = function() { 
    if (this.readyState == 4 && this.status == 200){
      console.log(xmlHttp.responseText);
      var notesJson=JSON.parse(xmlHttp.responseText);
      var notesArray=notesJson.notes;
      for(var i=0;i<notesArray.length;i++)
        {
          if(!showArchive){
            if(notesArray[i].status!="Completed")
              addNote(notesArray[i]);
          } else{
            if(notesArray[i].status=="Completed")
              addNote(notesArray[i], true);
          } 
            
        }
    }
  }
  document.getElementById("showArchivesButton").style.display="inline";
  document.getElementById("showTasksButton").style.display="none";
  document.getElementById("removeFilterButton").style.display="none";
}

function showArchives(userId){
  for(var i=1; i<=noteId; i++){
    removeElement('note-' + i);
  }
  noteId=0;
  showTasks(userId,true);
  document.getElementById("showArchivesButton").style.display="none";
  document.getElementById("showTasksButton").style.display="inline";
}

var noteId = 0; // used by the addFile() function to keep track of IDs
function addNote(data, showArchive=false) {
    noteId++; // increment fileId to get a unique ID for the new element
    var html='<br><div class="task">';
    if(!showArchive){
      html+='<div class="task_buttons"><a onclick=\'modifyNoteForm('+JSON.stringify(data)+')\' class="task_button" title="Modify note"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>'
        +'<a onclick=\'deleteNote('+JSON.stringify(data)+')\' class="task_button" title="Delete note"><i class="fa fa-trash-o" aria-hidden="true"></i></a></div>'; 
    }
    html += '<b>'+data.title+'</b><br>';
    if(data.description){
        html+=data.description+'<br>';
    }
    if(data.dueDate){ 
        html+='Due: '+data.dueDate.toString().substring(11,16)+' ('+data.dueDate.toString().substring(0,10)+') <br>';
    }
    if(data.status){
        html+='<span id="taskStatus'+noteId+'"> &#xf111; '+data.status+'</span>';
    }
    if(data.priority){
        html+='<span id="taskPriority'+noteId+'"> &#xf024; '+data.priority+'</span>';
    }
    if(data.label){
        html+='<span id="taskLabel'+noteId+'"> &#xf02b; '+data.label+'</span>';
    }
    html+='</p>';
    html+='</div>';
    addElement('tasks', 'p', 'note-' + noteId, html);
    document.getElementById('taskStatus'+noteId).className=document.getElementById('statusInput'+data.status).className;
    if(data.priority)
    document.getElementById('taskPriority'+noteId).className=document.getElementById('priorityInput'+data.priority).className;
    if(data.label)
    document.getElementById('taskLabel'+noteId).className=document.getElementById('labelInput'+data.label).className;
}

function modifyNoteForm(data){
  console.log(data);
  document.getElementById('noteIdInput').value=data._id;
  document.getElementById('taskForm').action="https://interesting-broadleaf-redcurrant.glitch.me/modify_note";
  document.getElementById('addTaskForm').style.display='block';
  document.getElementById('userIdInput').value=data.userId;
  document.getElementById('titleInput').value=data.title;
  if(data.description){
    document.getElementById('descriptionInput').value=data.description;
  }
  if(data.dueDate){
    document.getElementById('dueDateInput').value=data.dueDate.toString().substring(0,23);
  }
  document.getElementById('statusDropDown').style.display='inline';
  if(data.status){
    document.getElementById('statusList').value=data.status;
    document.getElementById('statusList').className=document.getElementById('statusInput'+data.status).className;
  }
  if(data.label){
    document.getElementById('labelInput'+data.label).selected=true; 
    document.getElementById('labelList').className=document.getElementById('labelInput'+data.label).className;
  }
  if(data.priority){
    document.getElementById('priorityInput'+data.priority).selected=true; 
    document.getElementById('priorityList').className=document.getElementById('priorityInput'+data.priority).className;
  }
}

function addTask(){
  document.getElementById('newTaskResetButton').click();
  document.getElementById('taskForm').action="https://interesting-broadleaf-redcurrant.glitch.me/note";
  document.getElementById('addTaskForm').style.display='block'; 
  document.getElementById('statusDropDown').style.display='none';
}

function deleteNote(data)
{
  console.log("deleteNote called.");
  var url = "https://interesting-broadleaf-redcurrant.glitch.me/note?noteId="+data._id;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("DELETE", url);
  xmlHttp.onload = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == "200") {
      console.log("HI");
      window.open("https://interesting-broadleaf-redcurrant.glitch.me/home?userId="+data.userId, '_parent');

    } else {
      console.log("error");
    }
  }
  xmlHttp.send(null);
}

function deleteUser(userId)
{
  var url = "https://interesting-broadleaf-redcurrant.glitch.me/user?userId="+userId;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("DELETE", url);
  xmlHttp.onload = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == "200") {
      console.log("HI");
      window.open("https://interesting-broadleaf-redcurrant.glitch.me/", '_parent');

    } else {
      console.log("error");
    }
  }
  xmlHttp.send(null);
}

function showFilteredTasks(){
  document.getElementById('filterSideNav').style.display='none';
  var url = "https://interesting-broadleaf-redcurrant.glitch.me/note?";
  var userId=document.getElementById('userIdFilterInput').value;
  url+="userId="+userId;
  if (document.getElementById('label1').checked) {
    var label1 = document.getElementById('label1').value;
    url+="&label1="+label1;
  }
  if (document.getElementById('label2').checked) {
    var label2 = document.getElementById('label2').value;
    url+="&label2="+label2;
  }
  if (document.getElementById('label3').checked) {
    var label3 = document.getElementById('label3').value;
    url+="&label3="+label3;
  }
  if (document.getElementById('label4').checked) {
    var label4 = document.getElementById('label4').value;
    url+="&label4="+label4;
  }
  if (document.getElementById('priority1').checked) {
    var priority1= document.getElementById('priority1').value;
    url+="&priority1="+priority1;
  }
  if (document.getElementById('priority2').checked) {
    var priority2= document.getElementById('priority2').value;
    url+="&priority2="+priority2;
  }
  if (document.getElementById('priority3').checked) {
    var priority3= document.getElementById('priority3').value;
    url+="&priority3="+priority3;
  }
  if (document.getElementById('priority4').checked) {
    var priority4= document.getElementById('priority4').value;
    url+="&priority4="+priority4;
  }
  if (document.getElementById('status1').checked) {
    var status1= document.getElementById('status1').value;
    url+="&status1="+status1;
  }
  if (document.getElementById('status2').checked) {
    var status2= document.getElementById('status2').value;
    url+="&status2="+status2;
  }
  if (document.getElementById('status3').checked) {
    var status3= document.getElementById('status3').value;
    url+="&status3="+status3;
  }
  var startingDateFilterInput = document.getElementById('startingDateFilterInput').value;
  var endingDateFilterInput = document.getElementById('endingDateFilterInput').value;
  if(startingDateFilterInput){
    url+="&startingDate="+startingDateFilterInput;
  }
  if(endingDateFilterInput!=""){
    url+="&endingDate="+endingDateFilterInput;
  }
  
  for(var i=1; i<=noteId; i++){
    removeElement('note-' + i);
  }
  noteId=0;
  
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url); 
  xmlHttp.send();
  
  xmlHttp.onreadystatechange = function() { 
    if (this.readyState == 4 && this.status == 200){
      console.log(xmlHttp.responseText);
      var notesJson=JSON.parse(xmlHttp.responseText);
      var notesArray=notesJson.notes;
      for(var i=0;i<notesArray.length;i++)
        {
          addNote(notesArray[i]);
        }
    }
  }
  document.getElementById("removeFilterButton").style.display="inline";
}