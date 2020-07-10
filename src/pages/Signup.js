import React, { Component } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
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
      <div className="container">
        <Header />
        <form className="mt-5 py-5 px-5" onSubmit={this.handleSubmit}>
          <h1>
            Sign Up to
            <Link className="title ml-2" to="/">
              Chatalone
            </Link>
          </h1>
          <p className="lead">Fill in the form below to create an account.</p>
          {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Name"
              name="name"
              type="text"
              onChange={this.handleChange}
              value={this.state.name}
            ></input>
          </div>
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Email"
              name="email"
              type="email"
              onChange={this.handleChange}
              value={this.state.email}
            ></input>
          </div>
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Password"
              name="password"
              onChange={this.handleChange}
              value={this.state.password}
              type="password"
            ></input>
          </div>
          <div className="form-group">
            <button className="btn btn-primary px-5" type="submit">
              Sign up
            </button>{" "}
            OR
            <button className="btn btn-danger mx-2" type="button" onClick={this.googleSignIn}>
              Sign up with Google
            </button>
          </div>
          {/* <button className="btn btn-secondary" type="button" onClick={this.githubSignIn}>
            Sign up with GitHub
          </button> */}
          <hr></hr>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    );
  }
}
