import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Transfers from './pages/Transfers';
import './i18n/i18n';

const App = () => {
  const { t } = useTranslation();

  // التحقق من وجود token
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // مكون الحماية للمسارات
  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/login" component={Login} />
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <ProtectedRoute exact path="/loans" component={Loans} />
          <ProtectedRoute exact path="/transfers" component={Transfers} />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route path="*">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;