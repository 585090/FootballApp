import { NavigationBar } from "../Components/utils/NavigationBar";
import { useNavigate } from 'react-router-dom';
import './Account.css'


export default function Account () {
    const playerJSON = localStorage.getItem('player');
    const player = playerJSON ? JSON.parse(playerJSON) : null;
 
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('player');
        navigate('/auth')
    }
    return (
        <div>
            <NavigationBar />
            <div className="AccountDetails-container">
                {player ? (
                    <div>
                        <h2> Account details </h2>
                        <p> <strong> Email: </strong> {player.email}</p>
                        <p> <strong> Usename: </strong> {player.name}</p>
                        <button className="AccountDetails-button" >More info</button>
                    </div>
            
                ) : (
                    <p>No account details available</p>
                )}
            </div>
            <div className="Account-buttons" >
                <button className="Account-button" onClick={handleSignOut} >Sign out</button>
            </div>
        </div>
    )
}