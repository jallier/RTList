import * as React from 'react';
import './App.css';
import { ListBox } from './listbox';

// const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div className="body">
        <header className="header">
          <h1 className="App-title">List</h1>
        </header>
        <ListBox/>
      </div>
    );
  }
}

export default App;
