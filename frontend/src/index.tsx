import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { App } from './components/App';
import { ProtectedRoute, ProtectedRouteProps } from './components/PrivateRoute';
import registerServiceWorker from './registerServiceWorker';
import './css/index.css';
import { Test } from './components/Test';
import { Login } from './components/Login';

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
