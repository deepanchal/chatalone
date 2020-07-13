import { auth } from "firebase";
import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class HomePage extends Component {
  render() {
    return (
      <div className="animated-bg">
        <h1 className="display-4">Chatalone</h1>
        <h4 className="">Chat Alone with friends!!</h4>
        {auth().currentUser ? (
          <div className="">
            <Link to="/chat" className="btn btn-primary btn-lg m-2">
              Chat
            </Link>
            <Link to="/chatroom" className="btn btn-secondary btn-lg m-2">
              Chatroom
            </Link>
          </div>
        ) : (
          <div className="">
            <Link to="/signup" className="btn btn-primary btn-lg m-2">
              <i class="fas fa-user-plus"></i> Signup
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg m-2">
              <i class="fas fa-sign-in-alt"></i> Login
            </Link>
          </div>
        )}
      </div>
    );
  }
}
