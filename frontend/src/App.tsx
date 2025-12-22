import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientProfile from './pages/PatientProfile';
import Auth from './pages/Auth';
import RppgCamera from './pages/RppgCamera';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <main className="container">
        <Switch>
          <Route path="/" exact component={Auth} />
          <Route path="/dashboard" exact component={Dashboard} />
          <Route path="/rppg" component={RppgCamera} />
          <Route path="/patient/:id" component={PatientProfile} />
        </Switch>
      </main>
    </Router>
  );
};

export default App;