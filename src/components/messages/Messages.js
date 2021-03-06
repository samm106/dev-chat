import React, { Component } from "react";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messages: [],
    numberUniqueUsers: "",
    messagesLoading: true,
    isChannelStarred: false,
    privateChannel: this.props.isPrivateChannel,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    searchTerm: "",
    searchLoading: false,
    searchResult: [],
    userRef: firebase.database().ref("user"),
    typingRef: firebase.database().ref("typing"),
    connectedRef: firebase.database().ref("info/connected"),
    listeners: [],
    typingusers: [],
  };

  componentDidMount() {
    const { user, channel, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUserStarListener(channel.id, user.uid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      listeners.ref.child(listener.id).off(listener.event);
    });
  };

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index !== -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  addUserStarListener = (channelId, userId) => {
    this.state.userRef
      .child(userId)
      .child("starred")
      .once("value")
      .then((data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  addListeners = (channelid) => {
    this.addMessageListeners(channelid);
    this.addTypingListeners(channelid);
  };

  addTypingListeners = (channelid) => {
    let typingusers = [];
    this.state.typingRef.child(channelid).on("child_added", (snap) => {
      if (snap.key !== this.state.user.uid) {
        typingusers = typingusers.concat({
          id: snap.key,
          name: snap.val(),
        });
        this.setState({ typingusers });
      }
    });
    this.addToListeners(channelid, this.state.typingRef, "child_added");
    this.state.typingRef.child(channelid).on("child_removed", (snap) => {
      const index = typingusers.find((user) => user.id === snap.key);
      if (index !== -1) {
        typingusers = typingusers.filter((user) => user.id !== snap.key);
        this.setState({ typingusers });
      }
    });
    this.addToListeners(channelid, this.state.typingRef, "child_removed");

    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelid)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove((err) => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
  };

  handleStar = () => {
    this.setState(
      (prevstate) => ({
        isChannelStarred: !prevstate.isChannelStarred,
      }),
      () => this.starChannel()
    );
  };
  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.userRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar,
          },
        },
      });
    } else {
      this.state.userRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  addMessageListeners = (channelid) => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelid).on("child_added", (snap) => {
      loadedMessages.push(snap.val());

      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
    this.addToListeners(channelid, ref, "child_added");
  };

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numberUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numberUniqueUsers });
  };

  countUserPosts = (message) => {
    let userPosts = message.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => {
        this.handleSearchMessage();
      }
    );
  };

  handleSearchMessage = () => {
    const channelMessage = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResult = channelMessage.reduce((acc, msg) => {
      if (
        (msg.content && msg.content.match(regex)) ||
        msg.user.name.match(regex)
      ) {
        acc.push(msg);
      }
      return acc;
    }, []);
    this.setState({
      searchResult,
    });
    setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 1000);
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  displayChannelName = (channel) =>
    channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : "";

  displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ));

  displayMessageSkeleton = (loading) =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      numberUniqueUsers,
      searchTerm,
      searchResult,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingusers,
      messagesLoading,
    } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numberUniqueUsers={numberUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />
        <Segment>
          <Comment.Group className="messages">
            {this.displayMessageSkeleton(messagesLoading)}
            {searchTerm
              ? this.displayMessages(searchResult)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingusers)}
            <div ref={(node) => (this.messagesEnd = node)}></div>
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
