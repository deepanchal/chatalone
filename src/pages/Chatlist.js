import React, { Component } from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
// import { firestore } from "../services/firebase";

export default class Chatlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      allusers: [],
      inputVal: "",
      error: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.chatIDGenerator = this.chatIDGenerator.bind(this);
  }

  componentDidMount() {}

  handleChange(event) {
    this.setState({
      inputVal: event.target.value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (this.state.inputVal) {
      try {
        const senderID = this.state.user.uid;
        const receiverID = await this.emailToID(this.state.inputVal);
        if (!receiverID) throw { message: "No friend found with that email 😕" };
        if (receiverID === senderID) throw { message: "You can't text yourself 💩" };
        const chatID = this.chatIDGenerator(this.state.user.uid, receiverID);
        this.props.history.push("/chat/" + chatID);
      } catch (error) {
        this.setState({ error: error.message });
      }
    }
  }

  async emailToID(email) {
    return db
      .ref("/users")
      .once("value")
      .then(function (snapshot) {
        for (const key in snapshot.val()) {
          // skip loop if the property is from prototype
          if (!snapshot.val().hasOwnProperty(key)) continue;
          const obj = snapshot.val()[key];
          for (const prop in obj) {
            // skip loop if the property is from prototype
            if (!obj.hasOwnProperty(prop)) continue;
            if (prop === "email" && obj[prop] === email) return obj["uid"];
          }
        }
      });
  }

  chatIDGenerator(ID1, ID2) {
    if (ID1 < ID2) return `${ID1}_${ID2}`;
    else return `${ID2}_${ID1}`;
  }

  render() {
    return (
      <div className="container">
        <Header />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ marginTop: "4.5rem" }}
        >
          <form onSubmit={this.handleSubmit} className="d-flex justify-content-center">
            <input
              type="email"
              placeholder="your friend's email..."
              name="inputVal"
              onChange={this.handleChange}
              className="form-control col-10"
            ></input>
            <button type="submit" className="form-control btn btn-submit mx-2 px-4">
              Chat
            </button>
          </form>
        </div>
        {this.state.error ? (
          <div className="alert alert-danger" role="alert">
            {this.state.error}
          </div>
        ) : null}
      </div>
    );
  }
}
