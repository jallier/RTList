import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { App } from "./components/App";
import registerServiceWorker from "./registerServiceWorker";
import "./css/index.css";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { rootReducer } from "./store";

const store = createStore(
  rootReducer,
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
