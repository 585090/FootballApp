import { NavigationBar } from "../Components/utils/NavigationBar"
import { useLocation } from 'react-router-dom';
import PredictionTable from '../Components/predictionTable/PredictionTable';


export function Home() {
  const location = useLocation();
  const {message} = location.state || {};
  
  return (
    <div className="home">
      <header className="home-header">
      <NavigationBar />
      </header>
      {message && <p>{ message }</p>}
      <p>Your go-to platform for predicting football match outcomes!</p>
      <PredictionTable competition={'PL'} />
    </div>
    
  )
}

