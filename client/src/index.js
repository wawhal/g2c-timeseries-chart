import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';

const link = new WebSocketLink({
  uri: 'wss://graphql2chartjs.herokuapp.com/v1alpha1/graphql'
})

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache
})

ReactDOM.render(
  <div style={{display: 'flex', 'alignItems': 'center', margin: '10px'}}>
    <ApolloProvider client={client}>
        <App client={client} />
    </ApolloProvider>
  </div>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
