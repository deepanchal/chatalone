import React, { Component } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

export default class Chatroom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
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
    try {
      db.ref("chatroom").on("value", (snapshot) => {
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
        await db.ref("chatroom").push({
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

  formatTime(timestamp) {
    const d = new Date(timestamp);
    const time = d.toLocaleTimeString().replace(/(.*)\D\d+/, "$1");
    return time;
  }

  render() {
    return (
      <div className="">
        {/* loading indicator */}
        {this.state.loadingChats ? <div className="spinner"></div> : ""}
        <section className="chat-container">
          <header className="chat-header">
            <Link to="/chat" className="px-2">
              <i className="fas fa-chevron-left"></i>
            </Link>
            <div className="chat-header-title">Chatroom</div>
            <div className="chat-settings">
              <Link to="/" className="px-2">
                <i className="fas fa-cog"></i>
              </Link>
            </div>
          </header>
          {this.state.readError ? (
            <div className="alert alert-danger py-0 m-0 rounded-0" role="alert">
              {this.state.readError}
            </div>
          ) : this.state.writeError ? (
            <div className="alert alert-danger py-0 m-0 rounded-0" role="alert">
              {this.state.writeError}
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
                    <div className="chat-info">
                      <div className="chat-info-name noselect">{chat.uname}</div>
                      <div className="chat-info-time noselect">
                        {this.formatTime(chat.timestamp)}
                      </div>
                    </div>
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
            ></input>
            <button type="submit" className="chat-sendbtn">
              {/* <i className="far fa-paper-plane"></i> */}
              Send
            </button>
          </form>
        </section>
      </div>
    );
  }
}
