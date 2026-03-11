"use client"
import { useState } from "react";

export default function UserForm() {
    const [url, setUrl] = useState("");

    const validateUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    };


    const handlesubmit = () => {
        if (validateUrl(url)) {
            // Handle form submission
        }
        else 
            alert("Please enter a valid URL");
    
    };

    return (<div>
        <label htmlFor="name">Url to monitor</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}>
        </input>
        <button disabled={!validateUrl(url)} onClick={handlesubmit}>Monitor</button>
    </div>)
}