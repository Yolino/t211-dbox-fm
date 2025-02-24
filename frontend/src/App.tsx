import React from 'react';
import logo from './logo.svg';
import pictoMusic from './images/musicNote.svg'
import showcase from './images/showcase.png'
import './styles/Mobile.css';
import Test from './components/Test';

function App() {
  return (
    <div className="App">
      <input id="searchBar" type="text" placeholder="search" />
    </div>
  );
}

function Account() {
  return (
    <div className="LogButtons">
        <button id="logIn">Se connecter</button>
        <button id="signIn">S'inscrire</button>
    </div>
  );
}

function Header() {
  return (
    <header>
      <div id="logoDbox"><p>Dbox</p></div>
      <div id="searchDiv">
        <input id="searchBar" type="text" placeholder="search" />
      </div>
        {Account() }
    </header>
  )
}

function Tile(id : string = "6969", user : string = "Showcase", title : string = "L'histoire d'un showcase", duration : string = "5h48m", imgMusic : string = pictoMusic) {
  return (
    <div className="Tiles" id={id}>
      <div className="Votes">
        <div className="Upvote"></div>
        <div className="Downvote"></div>
      </div>
      <img className="Picto" src={imgMusic}></img>
      <div className="Informations">
        <p className="User">{user}</p>
        <p className="Title">{title}</p>
        <p className="Duration">{duration}</p>
      </div>
    </div>
  );
}

function WhiteSpace() {
  return (
    <div className="WhiteSpace"></div>
  );
}

function TilesGroup(group : string = "Recent") {
  return (
    <div id={group}>
      <p className="GroupName">{group}</p>
      <div className="TilesGroup">
        {Tile("idShowcase","Mathéo Hertmans","showcase","3h00",showcase) }
        {Tile() }
        {Tile() }
        {Tile() }
        {Tile() }
        {Tile() }
      </div>
    </div>
  );
}

function CurrentMusic() {
  return (
    <audio controls id="music">
    </audio>
  );
}

function Footer() {
  return (
    <div className="BottomBar">
      {CurrentMusic() }
    </div>
  );
}

export {App, TilesGroup, Tile, Footer, Header, WhiteSpace}