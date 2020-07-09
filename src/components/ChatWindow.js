import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Button, Container, ProgressBar } from "react-bootstrap";

let socket;

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [yesCount, setYesCount] = useState(0);
  const [maybeCount, setMaybeCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [total, setTotal] = useState(0);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    socket.emit("send", newMessage);
    setNewMessage("");
  };

  const sendVote = (option) => {
    socket.emit("vote", option);
  };

  useEffect(() => {
    socket = socketIOClient(`http://localhost:3001`);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("receive", (message) => {
      //the "receive" must be the same name as the back-end
      setMessages([...messages, message]);
    });
    return () => socket.off("receive");
  }, [messages]);

  useEffect(() => {
    socket.on("receiveVote", (option) => {
      setTotal(total + 1);
      if (option === "yes") {
        setYesCount(yesCount + 1);
      }
      if (option === "maybe") {
        setMaybeCount(maybeCount + 1);
      }
      if (option === "no") {
        setNoCount(noCount + 1);
      }
    });
    return () => socket.off("receiveVote");
  }, [total, yesCount, maybeCount, noCount]);

  return (
    <div>
      <h1>Hello World</h1>
      <ul>
        {messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        ></input>
        <input type="submit" value="Send"></input>
      </form>
      <Container>
        <h2> Do you understand today's lecture</h2>
        <Button variant="success" onClick={(e) => sendVote("yes")}>
          Yes, I understand
        </Button>
        <Button variant="warning" onClick={(e) => sendVote("maybe")}>
          Maybe a bit
        </Button>
        <Button variant="danger" onClick={(e) => sendVote("no")}>
          No, I don't understand at all
        </Button>
        <ProgressBar>
          <ProgressBar
            animated
            key={1}
            variant="success"
            now={(yesCount * 100) / total}
          />
          <ProgressBar
            animated
            key={2}
            variant="warning"
            now={(maybeCount * 100) / total}
          />
          <ProgressBar
            animated
            key={3}
            variant="danger"
            now={(noCount * 100) / total}
          />
        </ProgressBar>
      </Container>
    </div>
  );
}
