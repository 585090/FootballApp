import React, { useState } from 'react';
import { NavigationBar } from '../Components/NavigatorBar';
import { Footer } from '../Components/Footer';
import './Forms.css';


export default function Login() {
    const [ player, setPlayer ] = useState({
        email: '',
        password: ''
        });
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setPlayer({...player, [name]: value});
    }

    const loginPlayer = async (event) => {
        event.preventDefault();
        console.log("Logging in player:", player.email);
        fetch('http://localhost:5000/api/players')
        .then(response => response.json())
        .then(data => {
            const existingPlayer = data.find(p => p.email === player.email && p.password === player.password);
            if (existingPlayer) {
                console.log("Login successful for:", player);
                
                // Redirect or perform further actions here
            
            } else {
                console.log("Invalid email or password.");
                alert("Invalid email or password.");
            }
        });
    }


    return (
        <div>
            <NavigationBar />
            <div className='FormContainer'>
                <h1 className="FormTitle">Login</h1>
                <form className="Form" onSubmit={loginPlayer}>
                    <label htmlFor="email">E-mail</label>
                    <input 
                    type="email"
                    name="email"
                    value={player.email} 
                    onChange={handleInputChange}
                    required />
                    <br />
                    <label htmlFor="password">Password</label>
                    <input 
                    type="password" 
                    name="password" 
                    value={player.password} 
                    onChange={handleInputChange}
                    required />
                    <br />
                    <button type="submit" className="FormButton">Login</button>
                </form>
            </div> 
            <Footer />
        </div>   
    )
}