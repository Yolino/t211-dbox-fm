import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/Mobile.css';
import {App, TilesGroup, Tile, Footer, Header, WhiteSpace} from './App';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      {Header() }
      {TilesGroup("Ajouts récents") }
      {TilesGroup("Les plus populaires") }
      {WhiteSpace() }
      {Footer() }
    </ApolloProvider>
  </React.StrictMode>
);

reportWebVitals();
