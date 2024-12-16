import {React,useState} from "react";
import { ethers } from "ethers";
import '../styles/mint.css';
import { setContentPrice } from "./content";

export const ContentSettings = () =>{
    const [contentId,setContentId] = useState("");
    const [price,SetContentPrice] = useState("");
    return(
        <div className="content-settings">
            <h3>Content Settings</h3>
            <p>Set price for a specific content making it VIP</p>
            <div className="content-settings__form">
                <form className="c_settings_form">
                    <input type="number" onChange={(e) => setContentId(e.target.value)} placeholder="content id" required value={contentId}/>
                    <label htmlFor="price">Price</label>
                    <input type="number"  onChange={(e)=> SetContentPrice(e.target.value)} placeholder="price usd" required value={price}/>
                    <br /><br />
                    <button type="submit" onSubmit={setContentPrice(contentId,price)}>set price</button>
                </form>
            </div>
        </div>
    )
}