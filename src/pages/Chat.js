import React, { Component } from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
// import { firestore } from "../services/firebase";

export default class Chat extends Component {
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
      const chatid = this.props.match.params.chatID;
      if (!(chatid.split("_").includes(this.state.user.uid)))
        throw { message: "You shouldn't be here 🤨" };

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
        await db.ref(`chats/${chatid}`).push({
          content: this.state.content,
          timestamp: Date.now(),
          uid: this.state.user.uid,
          uname: this.state.user.displayName,
        });
        this.setState({ content: "" });
        chatArea.scrollBy(0, chatArea.scrollHeight);
      } catch (error) {
        this.setState({ writeError: error.message });
      }
    }
  }

  formatTime(timestamp) {
    const d = new Date(timestamp);
    const time = `${d.getDate()}/${
      d.getMonth() + 1
    }/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    return time;
  }

  render() {
    return (
      <div className="content">
        <Header />
        {this.state.readError ? (
          <div className="alert alert-danger py-1" role="alert">
            {this.state.readError}
          </div>
        ) : null}
        <div className="content d-flex justify-content-center align-items-center">
          {/* loading indicator */}
          {this.state.loadingChats ? <div className="spinner"></div> : ""}
          <div className="chat-area" ref={this.myRef}>
            {/* chat area */}
            {this.state.chats.map((chat) => {
              return (
                <p
                  key={chat.timestamp}
                  className={
                    "chat-bubble " + (this.state.user.uid === chat.uid ? "current-user" : "")
                  }
                >
                  {chat.content}
                  <br />
                  <span className="chat-time float-right">
                    {this.formatTime(chat.timestamp) + " " + chat.uname}
                  </span>
                </p>
              );
            })}
          </div>
        </div>
        <form onSubmit={this.handleSubmit} className="form">
          <input
            type="text"
            placeholder="Message..."
            className="form-control col-5"
            name="content"
            onChange={this.handleChange}
            value={this.state.content}
            autoFocus
          ></input>
          <button type="submit" className="btn btn-submit mt-0 mx-2">
            Send
          </button>
        </form>
      </div>
    );
  }
}
