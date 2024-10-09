import {React , useState} from 'react';
import '../styles/profile.css';
import tech from '../images/technology.png';

export const EditProfile = () => {

    const renderFile = () => {
        const render = document.querySelector('img')
        const file = document.querySelector('input[type=file]').files[0]
        const reader = new FileReader();
        
        
        reader.addEventListener('load' , ()=> {
          render.src = reader.result;
        }, false)
      
        if(file){
          reader.readAsDataURL(file);
        }
      }
   
    return(
        <div className='profile'>
          <div className='profile_image'>
            <img src='' id='rendered-image'/>
            <input type='file' id='profile_upload' className='profile_img' onChange={renderFile}/>
          </div>
        </div>
        
    )
}