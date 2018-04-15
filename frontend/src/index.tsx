import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { App, Test, Protected } from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
  <Router>
    <div>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/test">Test</Link></li>
      <li><Link to="/protected">Protected</Link></li>

      <Route exact={true} path="/" component={App} />
      <Route path="/test" component={Test} />
      <Route path="/protected" component={Protected} />
    </div>
  </Router>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
