import React from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientProfile from './pages/PatientProfile';
import Auth from './pages/Auth';
import RppgCamera from './pages/RppgCamera';
import Header from './components/Header';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = Boolean(localStorage.getItem('token') || localStorage.getItem('swaas-auth-session'));

  return (
    <Route
      {...rest}
      render={props => (isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)}
    />
  );
};

const App = () => {
  return (
    <Router>
      <Header />
      <main className="container">
        <Switch>
          <Route path="/" exact component={Auth} />
          <ProtectedRoute path="/dashboard" exact component={Dashboard} />
          <ProtectedRoute path="/rppg" component={RppgCamera} />
          <ProtectedRoute path="/patient/:id" component={PatientProfile} />
        </Switch>
      </main>
    </Router>
  );
};

export default App;