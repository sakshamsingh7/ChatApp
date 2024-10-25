const socket = io('http://localhost:8080');

const form=document.getElementById('send-form');
let messageInp=document.getElementById('messageInp');
const messageContainer=document.querySelector(".container");
 
var audio=new  Audio('ding.mp3');
form.addEventListener('submit',(e)=>{
    e.preventDefault();//prevents reloading of the form
    const message=messageInp.value;
    append(`You:${message}`,'right');
    //we will let socket know that we have sent the message
    socket.emit('send',message);
    messageInp.value=' ';

});
// this means that now you can make and modify the same whole message 
//container and put new message everytime


//prompt to flash on screen for everytime you refresh

//now we will listen to an event for new user joined
const na = prompt("Enter your name to join");
socket.emit('new-user-joined', na);

//if user is joined we will get some data and we have to append it 
const append=(message,position)=>{
const messageElement=document.createElement('div');//naya div banaya hai usme message aur position dal ke main container me append kr denge
messageElement.innerText=message;
messageElement.classList.add('message');
messageElement.classList.add(position);
messageContainer.append(messageElement);
if(position=='left'){
audio.play();}
}
socket.on('user-joined',na=>{
append(`${na} joined the chat `,'right');
})
socket.on('receive',data=>{
    append(`${data.name }:${data.message}`,'left');
    })
socket.on('left',name=>{
        append(`${name } left the chat`,'left');
        })
socket.on('previous-messages', (messages) => {
            messages.forEach((data) => {
              append(`${data.name}: ${data.message}`, 'left');
            });
          });
          


