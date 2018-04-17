import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { App, Test, Login, TestPrivate } from './App';
import { ProtectedRoute, ProtectedRouteProps } from './PrivateRoute';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

let test: ProtectedRouteProps = {
  isAuthenticated: false,
  authenticationPath: '/login'
};

ReactDOM.render(
  <Router>
    <div>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/test">Test</Link></li>
      <li><Link to="/protected">Protected</Link></li>

      <Route exact={true} path="/" component={App} />
      <Route path="/test" component={Test} />
      <Route path="/login" component={Login} />
      <ProtectedRoute {...test} exact={true} path="/protected" component={TestPrivate} />
    </div>
  </Router>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
