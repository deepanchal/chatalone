import React, { Component } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
// import { firestore } from "../services/firebase";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      friendName: null,
      chats: [],
      content: "",
      readError: null,
      writeError: null,
      loadingChats: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.myRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({ readError: null, loadingChats: true });

    const chatArea = this.myRef.current;
    const chatContainer = document.querySelector("section.chat-container");
    chatContainer.style.height = window.innerHeight + "px";

    try {
      const chatid = this.props.match.params.chatID;
      if (!chatid.split("_").includes(this.state.user.uid)) {
        this.props.history.push("/chat");
        throw { message: "You shouldn't be here 🤨" };
      }

      await this.setFriendName();
      db.ref(`chats/${chatid}`).on("value", (snapshot) => {
        let chats = [];
        snapshot.forEach((snap) => {
          chats.push(snap.val());
        });
        chats.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });
        this.setState({ chats });
        chatArea.scrollBy(0, chatArea.scrollHeight);
        this.setState({ loadingChats: false });
      });
    } catch (error) {
      this.setState({ readError: error.message, loadingChats: false });
    }
  }

  handleChange(event) {
    this.setState({
      content: event.target.value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    const chatArea = this.myRef.current;
    if (this.state.content) {
      try {
        const chatid = this.props.match.params.chatID;
        if (!chatid.split("_").includes(this.state.user.uid)) {
          this.props.history.push("/chat");
          throw { message: "You shouldn't be here 🤨" };
        }
        await db.ref(`chats/${chatid}`).push({
          content: this.state.content,
          timestamp: Date.now(),
          uid: this.state.user.uid,
          uname: this.state.user.displayName,
        });
        this.setState({ content: "" });
        document.querySelector(".chat-input").focus();
        chatArea.scrollBy(0, chatArea.scrollHeight);
      } catch (error) {
        this.setState({ writeError: error.message });
      }
    }
  }

  async setFriendName() {
    const chatID = this.props.match.params.chatID;
    const x = chatID.split("_");
    const friendID = x[0] === this.state.user.uid ? x[1] : x[0];

    await db
      .ref(`users/${friendID}`)
      .once("value")
      .then((snapshot) => {
        this.state.friendName = snapshot.val().uname;
      });
  }

  formatTime(timestamp) {
    const d = new Date(timestamp);
    // const time = `${d.getDate()}/${
    //   d.getMonth() + 1
    // }/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    const time = d.toLocaleTimeString();
    return time;
  }

  render() {
    return (
      <div className="content">
        {/* loading indicator */}
        {this.state.loadingChats ? <div className="spinner"></div> : ""}
        <section className="chat-container">
          <header className="chat-header">
            <Link to="/chat" className="px-2">
              <i className="fas fa-chevron-left"></i>
            </Link>
            <div className="chat-header-title">{this.state.friendName}</div>
            <div className="chat-settings">
              <Link to="/" className="px-2">
                <i className="fas fa-cog"></i>
              </Link>
            </div>
          </header>
          {this.state.readError ? (
            <div className="alert alert-danger py-0 rounded-0" role="alert">
              {this.state.readError}
            </div>
          ) : null}

          <main className="chatarea" ref={this.myRef}>
            {/* chat area */}
            {this.state.chats.map((chat) => {
              return (
                <div
                  key={chat.timestamp}
                  className={
                    "msg " + (this.state.user.uid === chat.uid ? "right-msg" : "left-msg")
                  }
                >
                  <div className="chat-bubble">
                    {/* <div className="chat-info">
                      <div className="chat-info-name noselect">{chat.uname}</div>
                      <div className="chat-info-time noselect">{this.formatTime(chat.timestamp)}</div>
                    </div> */}
                    <div className="msg-text">{chat.content}</div>
                  </div>
                </div>
              );
            })}
          </main>
          <form onSubmit={this.handleSubmit} className="chat-inputarea">
            <input
              type="text"
              placeholder="Message..."
              className="chat-input"
              name="content"
              onChange={this.handleChange}
              value={this.state.content}
              autoFocus
            ></input>
            <button type="submit" className="chat-sendbtn">
              Send
            </button>
          </form>
        </section>
      </div>
    );
  }
}
