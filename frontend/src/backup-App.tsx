import React from 'react';
import logo from './logo.svg';
import './styles/Mobile.css';
import Test from './components/Test';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Test />
      </header>
    </div>
  );
}

export default App;
