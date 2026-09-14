const ACCESS_KEY='isaiahs-mlv:access:v1';
const PASSWORD='123ooo#@!OOO';
function unlock(){document.documentElement.classList.remove('access-locked');try{localStorage.setItem(ACCESS_KEY,'granted')}catch{}}
function showError(){const e=document.getElementById('access-error');if(e){e.hidden=false;e.textContent='Incorrect password.'}}
try{if(localStorage.getItem(ACCESS_KEY)==='granted')unlock()}catch{}
document.addEventListener('DOMContentLoaded',()=>{const form=document.getElementById('access-form'),input=document.getElementById('access-password');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();if(input.value===PASSWORD)unlock();else{showError();input.select()}});input.addEventListener('input',()=>{const e=document.getElementById('access-error');if(e)e.hidden=true})});