import { Footer } from "../Components/Footer"
import { NavigationBar } from "../Components/NavigatorBar"
export function Home() {
  return (
    <div className="home">
      <header className="home-header">
      <NavigationBar />
      </header>
      
      <p>Your go-to platform for predicting football match outcomes!</p>
      
      <div className="home-footer">
      <Footer />
      </div>
    </div>
    
  )
}

