import React from 'react';
import './App.css';
import { Scene } from "./Scene";
import { Details}  from './Details';
import { FaTelegramPlane } from 'react-icons/fa';

const App: React.FC = () => {
  return (
    <div className="App">
  
      <Scene />
      <Details title='Kot vpn bot'>
        <div>
        <div className='caption'>Безлимитный <br/>не отслеживаемый vpn!</div>
        <a href="https://t.me/KotVPNbot" target="_blank" rel="noopener noreferrer"  className="button">
          <FaTelegramPlane  className="icon"  data-testid="telegram-icon"/>
          <span>Добро пожаловать в бота</span>
        </a>
  
        </div>
      </Details>
      <footer className="footer">Фром Раша виз лав 👨‍💻🤍</footer>
    </div>
  );
}

export default App;
