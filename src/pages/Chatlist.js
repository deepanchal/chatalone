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

  async componentDidMount() {
    this.setState({ error: null, loading: true });
    try {
      const snapshot = await db.ref(`users/${this.state.user.uid}/friends`).once("value");
      let list = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          var element = snapshot.val()[key];
          // Getting last chat message info with chatID
          var lastMsg = await db.ref(`chats/${element.chatID}`).limitToLast(1).once("value");
          if (lastMsg.exists()) {
            const val = lastMsg.val();
            element["lastMsg"] = val[Object.keys(val)[0]].content;
            element["lastMsgTimestamp"] = val[Object.keys(val)[0]].timestamp;
          }
          list.push(element);
        }
      }
      this.setState({ friendsList: list, loading: false });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  handleChange(event) {
    this.setState({
      inputVal: event.target.value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ error: null });
    const senderID = this.state.user.uid;
    if (this.state.inputVal) {
      try {
        const receiverID = await this.emailToID(this.state.inputVal);
        if (!receiverID) throw { message: "No friend found with that email 😕" };
        if (receiverID === senderID) throw { message: "You can't text yourself 💩" };
        await this.makeFriends(senderID, receiverID);
        const chatID = this.chatIDGenerator(senderID, receiverID);
        this.props.history.push("/chat/" + chatID);
      } catch (error) {
        this.setState({ error: error.message });
      }
    }
  }

  async emailToID(email) {
    const snapshot = await db.ref("users").once("value");
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
    return null;
  }

  async makeFriends(currentUserID, friendID) {
    const currentUserObj = await (await db.ref(`users/${currentUserID}`).once("value")).val();
    currentUserObj.chatID = this.chatIDGenerator(currentUserID, friendID);
    delete currentUserObj.friends;  // deleting additional user property

    const friendObj = await (await db.ref(`users/${friendID}`).once("value")).val();
    friendObj.chatID = this.chatIDGenerator(currentUserID, friendID);
    delete friendObj.friends;       // deleting additional user property

    return (
      db.ref(`users/${currentUserID}/friends/${friendID}`).set(friendObj) &&
      db.ref(`users/${friendID}/friends/${currentUserID}`).set(currentUserObj)
    )   // Adding new Friend in both user's document
  }

  timeSince(timeStamp) {
    if (!timeStamp) return null;
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = Date.now() - timeStamp;

    if (elapsed < msPerMinute) {
      const x = Math.round(elapsed / 1000);
      return x === 1 ? x + " second ago" : x + " seconds ago";
    } else if (elapsed < msPerHour) {
      const x = Math.round(elapsed / msPerMinute);
      return x === 1 ? x + " minute ago" : x + " minutes ago";
    } else if (elapsed < msPerDay) {
      const x = Math.round(elapsed / msPerHour);
      return x === 1 ? x + " hour ago" : x + " hours ago";
    } else if (elapsed < msPerMonth) {
      const x = Math.round(elapsed / msPerDay);
      return x === 1 ? x + " day ago" : x + " days ago";
    } else if (elapsed < msPerYear) {
      const x = Math.round(elapsed / msPerMonth);
      return x === 1 ? x + " month ago" : x + " months ago";
    } else {
      const x = Math.round(elapsed / msPerYear);
      return x === 1 ? x + " year ago" : x + " years ago";
    }
  }   // function to convert unix timestamp to relative time

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
              <Link onClick={() => auth().signOut()} to="/" className="px-2">
                <i className="fas fa-sign-out-alt"></i>
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
                    Public Chatroom <i className="fas fa-arrow-right"></i>
                  </h5>
                </div>
              </Link>
              {this.state.friendsList.map((friend, index) => {
                return (
                  <Link
                    key={index}
                    to={"/chat/" + friend.chatID}
                    className="list-group-item list-group-item-action rounded-0"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-0 font-weight-bold">{friend.uname}</h5>
                      <small className="text-right">
                        {this.timeSince(friend.lastMsgTimestamp)}
                      </small>
                    </div>
                    <small className="mb-1">{friend.email}</small>
                    <small className="text-muted">{friend.lastMsg}</small>
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
