import React, { Component } from "react";
import { Link } from "react-router-dom";
import { signin, signInWithGoogle, signInWithGitHub } from "../helpers/auth";

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      error: null,
      email: "",
      password: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.googleSignIn = this.googleSignIn.bind(this);
    this.githubSignIn = this.githubSignIn.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ error: "" });
    try {
      await signin(this.state.email, this.state.password);
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  async googleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  async githubSignIn() {
    try {
      await signInWithGitHub();
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  render() {
    return (
      <div className="animated-bg">
        <form className="p-3 mx-3 bg-light" autoComplete="off" onSubmit={this.handleSubmit}>
          <h3 className="mb-3">
            Login to
            <Link className="title ml-2" to="/">
              Chatalone
            </Link>
          </h3>
          {this.state.error ? (
            <div className="alert alert-danger py-0">{this.state.error}</div>
          ) : null}
          <input
            className="form-control mb-2"
            placeholder="Email"
            name="email"
            type="email"
            onChange={this.handleChange}
            value={this.state.email}
          />
          <input
            className="form-control mb-2"
            placeholder="Password"
            name="password"
            onChange={this.handleChange}
            value={this.state.password}
            type="password"
          />
          <button className="btn btn-primary px-5" type="submit">
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <hr className="my-2" />
          <button className="btn btn-danger m-1" type="button" onClick={this.googleSignIn}>
            <i className="fab fa-google"></i> Sign in with Google
          </button>
          <button className="btn btn-secondary m-1" type="button" onClick={this.githubSignIn}>
            <i className="fab fa-github"></i> Sign in with GitHub
          </button>
          <hr className="my-2" />
          <h6>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </h6>
        </form>
      </div>
    );
  }
}
