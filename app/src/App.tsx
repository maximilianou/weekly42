import React, { useState } from 'react';
import './App.css';
import List from './comp/List';

interface IState {
  people: {
    name: string,
    height: number,
    url: string,
    note?: string 
  }[]
}

function App() {

  const [people, setPeople] = useState<IState["people"]>([]);
  return (
    <div className="App">
      <h1>People</h1>
      <List people={people} />
    </div>
  );
}

export default App;
