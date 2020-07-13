import React, { Component } from "react";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Chatroom from "./pages/Chatroom";
import Chatlist from "./pages/Chatlist";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { auth } from "./services/firebase";
import "./styles.css";

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated === true ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
}

function PublicRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated === false ? <Component {...props} /> : <Redirect to="/chat" />
      }
    />
  );
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      loading: true,
    };
  }

  componentDidMount() {
    // Eventlistener for changing viewport height to avoid bad user experience for mobile users
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    window.addEventListener("resize", () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });

    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false,
        });
      } else {
        this.setState({
          authenticated: false,
          loading: false,
        });
      }
    });
  }

  render() {
    return this.state.loading === true ? (
      <div className="spinner"></div>
    ) : (
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <PrivateRoute
            path="/chatroom"
            authenticated={this.state.authenticated}
            component={Chatroom}
          />
          <PrivateRoute
            exact
            path="/chat"
            authenticated={this.state.authenticated}
            component={Chatlist}
          />
          <PrivateRoute
            path="/chat/:chatID"
            authenticated={this.state.authenticated}
            component={Chat}
          />
          <PublicRoute
            path="/signup"
            authenticated={this.state.authenticated}
            component={Signup}
          />
          <PublicRoute
            path="/login"
            authenticated={this.state.authenticated}
            component={Login}
          />
        </Switch>
      </Router>
    );
  }
}

export default App;
