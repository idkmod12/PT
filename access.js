const PASSWORD='123ooo#@!OOO';
function unlock(){document.documentElement.classList.remove('access-locked')}
function showError(){const e=document.getElementById('access-error');if(e){e.hidden=false;e.textContent='Incorrect password.'}}
document.addEventListener('DOMContentLoaded',()=>{const form=document.getElementById('access-form'),input=document.getElementById('access-password');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();if(input.value===PASSWORD)unlock();else{showError();input.select()}});input.addEventListener('input',()=>{const e=document.getElementById('access-error');if(e)e.hidden=true})});
