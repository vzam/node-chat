# vichat

## Introduction

I am a software developer living at the Rursee in Germany. Some time ago I got an exercise to build a chat application, so this is my take at it. I have prior experience with node.js, react and angular. In early days I was also using jQuery.
Now, I wanted to go a step further and learn how to deal with web components in this project. In my previous research about the topic, I saw an interesting article about the [flaws of web components](https://www.thinktecture.com/de/web-components/flaws/) and I have considered technologies like [stencil](https://stenciljs.com/) for this project. One reason for me to still use web components is because I wanted to get back to the roots of modern javascript, which is what anything else ultimately boils down to. Understanding the core concepts may help in understanding the reasoning and popularity of yet-another-frontend-library.

These are the technical requirements for the project:

-   node.js backend talking to a front-end via web sockets
-   choose a nickname and a language to login
-   send messages into a chatroom and receive messages from others
-   translate messages using an external API into the chosen language of a user
-   allow multiple chatrooms
-   allow only the creator of a chatroom to post messages there

## Server

### Web sockets

The server listens for websocket connections at `:8080`. The websocket implementation has events like `open`, `close` and `message`. Since we have many event listeners for `message`, there is a multiplexer (mux) which further splits that event for more granular handlers. An adapter then connects a multiplexer with the websocket, because there are two different ws implementations for the server and the client (`ws` and `WebSocket`).

### Authentication

When a client joins a channel, the server returns a jwt which has to be used for other requests like sending messages. This was easy to implement and complies with the most important rule when it comes to securing access: don't roll your own.

### Storage

Anything is stored in-memory for simplicity. The `Client` is the only place where it is okay to refer to websocket objects, because they will be mapped to client ids. `Channel`s and `Message`s refer to that client id. When sending a response to a client, a reverse lookup is being made by the client id to the websocket which belongs to it.

## Client

### Web sockets

Just like the server, the client too has a multiplexer for splitting the `message` event and an adapter which connects the multiplexer to the `WebSocket`. When the page loads, the client connects to the open web socket at the server. Currently the client does not recover from a closed or erroneous web socket, but it would make sense to implement a heartbleed and reconnect later on.

### Storage

There is a global import named `store` which contains info about the current user and methods to change the state. Other libraries inject such objects into nested components, but for this project that would probably be too overkill.
