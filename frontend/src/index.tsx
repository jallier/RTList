import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { App } from "./components/App";
import registerServiceWorker from "./registerServiceWorker";
import "./css/index.css";
import { createStore, combineReducers } from "redux";
import { itemReducer } from "./store/reducers";
import { Provider } from "react-redux";

const appReducers = combineReducers({ itemReducer });

const store = createStore(
  appReducers,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
