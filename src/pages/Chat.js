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
      deletePrompt: false,
      deletionMsgRef: "",
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
        this.setState({ loadingChats: false });
        chatArea.scrollBy(0, chatArea.scrollHeight);
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
    const time = d.toLocaleTimeString().replace(/(.*)\D\d+/, "$1");
    return time;
  }

  render() {
    return (
      <div>
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
                  <div
                    className="chat-bubble"
                    onDoubleClick={async () => {
                      if (chat.uid !== this.state.user.uid) return;
                      const chatid = this.props.match.params.chatID;
                      this.setState({ deletePrompt: true });
                      const x = await db
                        .ref(`chats/${chatid}`)
                        .orderByChild("timestamp")
                        .equalTo(chat.timestamp)
                        .once("value");
                      this.setState({
                        deletionMsgRef: `chats/${chatid}/${Object.keys(x.val())[0]}`,
                      });
                    }}
                  >
                    <div className="msg-text">{chat.content}</div>
                    <div className="chat-info-time noselect text-right">
                      {this.formatTime(chat.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </main>
          {this.state.deletePrompt ? (
            <div
              className="d-flex justify-content-between align-items-center alert alert-danger mb-0 mt-1 rounded-0 py-1 px-2"
              role="alert"
            >
              <span>Do you wish to delete that message?</span>
              <div className="d-flex">
                <button
                  type="button"
                  className="btn btn-sm py-0 mr-1 btn-outline-danger"
                  onClick={() => {
                    db.ref(this.state.deletionMsgRef).remove();
                    this.setState({ deletePrompt: false });
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-sm py-0 btn-outline-success"
                  onClick={() => this.setState({ deletePrompt: false })}
                >
                  No
                </button>
              </div>
            </div>
          ) : null}
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
              Send
            </button>
          </form>
        </section>
      </div>
    );
  }
}
