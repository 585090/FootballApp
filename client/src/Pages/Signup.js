import React, { useState } from 'react';
import { NavigationBar } from '../Components/NavigatorBar';
import { Footer } from '../Components/Footer';
import './Forms.css';

export default function Signup() {
    const [ player, setPlayer ] = useState({
        email: '',
        name: '',
        password: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setPlayer({...player, [name]: value});
    }

    const registerPlayer = async (event) => {
        event.preventDefault();    
        console.log("Registering player:", player);
        
        fetch('http://localhost:5000/api/players')
        .then(response => response.json())
        .then(data => {
            const existingPlayer = data.find(p => p.email === player.email);
            if (!existingPlayer) {
                fetch('http://localhost:5000/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(player)
            })
            }
            else {
                console.log("Player already exists, please log in.");
                alert("Player already exists, please log in.");
                }
            })
    }

    return (
        <div>
            <NavigationBar />
            <div className='FormContainer'>
                <h1 className="FormTitle">Sign up</h1>
                <form className="Form" onSubmit={registerPlayer}>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        className="email" 
                        name="email" 
                        value={player.email} 
                        onChange={handleInputChange} 
                        required />
                    <br />
                    <label htmlFor="name">Name:</label>
                    <input 
                        type="text" 
                        className="name" 
                        name="name" required 
                        value={player.name} 
                        onChange={handleInputChange} />
                    <br />
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password" 
                        className="password" 
                        name="password" 
                        required 
                        value={player.password} 
                        onChange={handleInputChange}/>
                    <button type="submit" className="FormButton">Sign Up</button>
                </form>
            </div>
            <Footer />
        </div>
    )
}