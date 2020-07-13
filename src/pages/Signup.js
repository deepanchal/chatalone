import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../helpers/auth";
import {
  signup,
  addUserToDB,
  signInWithGoogle,
  signInWithGitHub,
  updateDisplayName,
} from "../helpers/auth";

export default class SignUp extends Component {
  constructor() {
    super();
    this.state = {
      error: null,
      name: "",
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
      if (!this.state.name) throw { message: "Your name can't be blank" };
      await signup(this.state.email, this.state.password);
      await updateDisplayName(this.state.name);
      await addUserToDB();
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
      console.log(error);
      this.setState({ error: error.message });
    }
  }

  render() {
    return (
      <div className="animated-bg">
        <form className="p-3 mx-3 bg-light" onSubmit={this.handleSubmit}>
          <h3 className="mb-3">
            Signup to
            <Link className="ml-2" to="/">
              Chatalone
            </Link>
          </h3>
          {this.state.error ? (
            <div className="alert alert-danger py-0">{this.state.error}</div>
          ) : null}
          <input
            className="form-control mb-2"
            placeholder="Name"
            name="name"
            type="text"
            onChange={this.handleChange}
            value={this.state.name}
          ></input>
          <input
            className="form-control mb-2"
            placeholder="Email"
            name="email"
            type="email"
            onChange={this.handleChange}
            value={this.state.email}
          ></input>
          <input
            className="form-control mb-2"
            placeholder="Password"
            name="password"
            onChange={this.handleChange}
            value={this.state.password}
            type="password"
          ></input>
          <button className="btn btn-primary px-5" type="submit">
            <i class="fas fa-user-plus"></i> Signup
          </button>
          <hr className="my-2" />
          <button className="btn btn-danger m-1" type="button" onClick={this.googleSignIn}>
            <i class="fab fa-google"></i> Sign up with Google
          </button>
          <button className="btn btn-secondary m-1" type="button" onClick={this.githubSignIn}>
            <i class="fab fa-github"></i> Sign up with GitHub
          </button>
          <hr className="my-2" />
          <h6 className="mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </h6>
        </form>
      </div>
    );
  }
}
