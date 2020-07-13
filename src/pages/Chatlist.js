import React, { Component } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

export default class Chatlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      inputVal: "",
      error: null,
      friendsList: [],
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.chatIDGenerator = this.chatIDGenerator.bind(this);
  }

  componentDidMount() {
    this.setState({ error: null, loading: true });
    db.ref(`users/${this.state.user.uid}/friends`)
      .once("value")
      .then((snapshot) => {
        let list = [];
        snapshot.forEach((snap) => {
          list.push(snap.val());
        });
        this.setState({ friendsList: list });
        console.log(this.state.friendsList);
        this.setState({ loading: false });
      })
      .catch((error) => {
        this.setState({ error: error.message, loading: false });
      });
  }

  handleChange(event) {
    this.setState({
      inputVal: event.target.value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.startChat(this.state.inputVal);
  }

  async startChat(email) {
    if (email) {
      try {
        const senderID = this.state.user.uid;
        const receiverID = await this.emailToID(email);
        if (!receiverID) throw { message: "No friend found with that email 😕" };
        if (receiverID === senderID) throw { message: "You can't text yourself 💩" };
        this.addFriendToList(receiverID);
        const chatID = this.chatIDGenerator(this.state.user.uid, receiverID);
        this.props.history.push("/chat/" + chatID);
      } catch (error) {
        this.setState({ error: error.message });
      }
    }
  }

  async emailToID(email) {
    return db
      .ref("users")
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

  async addFriendToList(friendID) {
    const friendObj = await db
      .ref(`users/${friendID}`)
      .once("value")
      .then((snapshot) => {
        var result = snapshot.val();
        delete result.friends;
        return result;
      })
      .catch((err) => {
        return {};
      });
    friendObj.chatID = this.chatIDGenerator(this.state.user.uid, friendID);
    return db.ref(`users/${this.state.user.uid}/friends/${friendID}`).set(friendObj);
  }

  chatIDGenerator(ID1, ID2) {
    if (ID1 < ID2) return `${ID1}_${ID2}`;
    else return `${ID2}_${ID1}`;
  }

  render() {
    return (
      <div>
        {/* loading indicator */}
        {this.state.loading ? <div className="spinner"></div> : ""}
        <div className="chat-container">
          <header className="chat-header">
            <Link to="/" className="px-2">
              <i className="fas fa-chevron-left"></i>
            </Link>
            <div className="chat-header-title">
              <Link to="/">Chatalone</Link>
            </div>
            <div className="chat-settings">
              <Link onClick={() => auth().signOut()} className="px-2">
                <i class="fas fa-sign-out-alt"></i>
              </Link>
            </div>
          </header>
          <div className="alert alert-success m-0 py-0 rounded-0" role="alert">
            Logged in: {this.state.user.displayName} ({this.state.user.email})
          </div>
          {this.state.error ? (
            <div className="alert alert-danger m-0 py-0 rounded-0" role="alert">
              {this.state.error}
            </div>
          ) : null}

          <form onSubmit={this.handleSubmit} className="chat-inputarea mt-2">
            <input
              type="email"
              placeholder="Your friend's email..."
              name="inputVal"
              onChange={this.handleChange}
              className="chat-input"
            ></input>
            <button type="submit" className="chat-sendbtn">
              Chat
            </button>
          </form>

          <main className="chatarea px-0">
            <ul className="list-group">
              <Link
                to={"/chatroom"}
                className="list-group-item list-group-item-action list-group-item-primary rounded-0"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="my-2 font-weight-bold">
                    Public Chatroom <i class="fas fa-arrow-right"></i>
                  </h5>
                </div>
              </Link>
              {this.state.friendsList.map((friend) => {
                return (
                  <Link
                    key={friend.uid}
                    to={"/chat/" + friend.chatID}
                    className="list-group-item list-group-item-action rounded-0"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1 font-weight-bold">{friend.uname}</h5>
                      <small></small>
                    </div>
                    <small>{friend.email}</small>
                  </Link>
                );
              })}
            </ul>
          </main>
        </div>
      </div>
    );
  }
}
