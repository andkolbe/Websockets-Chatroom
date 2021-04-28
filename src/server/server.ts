const express = require('express');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')))
app.use(express.json());
app.use(express.static('public'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port: ${port}`));

// websocket server that allows us to perform the websockets handshake
const WebSocketServer = require('websocket').server; // .server keeps track of every connected client
// create a raw http server (this will help us create the TCP connection which will then pass to the websocket to do the job)
const httpServer = http.createServer();
httpServer.listen(8080, () => console.log('Server listening on port: 8080'));


// store a hash map of all of the clients and their connections
const clients = {};
// same with each new chat room that is created
const chatRooms = {};

// pass our http server into our websockets server
const wsServer = new WebSocketServer({ httpServer });

// if someone requests the websocket, go ahead and call this function
wsServer.on('request', request => {
    // connect
    const connection = request.accept(null, request.origin);
    // events that happen on the connection
    connection.on('open', () => console.log('Opened!'));
    connection.on('close', () => console.log('Closed!'));
    // what to do when our web socket server receives a message from a client
    connection.on('message', message => {

        // the utf8 data is the data the server will receive from the client
        // parse the JSON recevied from the client into something the server can understand
        const result = JSON.parse(message.utf8Data) // message is a JSON object, we want to receive the UTF 8 data

        // if a client wants to create a new chat room
        if (result.method === 'create') {
            // the clientId is the same as the clientId that clicked on the New Chatroom button
            const clientId = result.clientId
            const chatRoomId = uuidv4().slice(0, 4);
            chatRooms[chatRoomId] = {
                'id': chatRoomId,
                'clients': [] // build an empty array that will fill with the clients who join the game
            }

            const payload = {
                'method': 'create',
                'chatRoom': chatRooms[chatRoomId]
            }

            // use the unique clientId to retrieve the connection
            const con = clients[clientId].connection; // .connection comes from the object we created on line 61
            con.send(JSON.stringify(payload));
        }

        // if a client wants to join a chat room
        if (result.method === 'join') {
            // the clientId is the same as the clientId that clicked on the Join Chatroom button
            const clientId = result.clientId
            const chatRoomId = result.chatRoomId
            const chatRoom = chatRooms[chatRoomId];
            chatRoom.clients.push({ 'clientId': clientId }) // push every new client who joins the game onto the clients array by their id

            // start the chatroom
            if (chatRoom.clients.length === 1) updateChatState();

            const payload = {
                'method': 'join',
                'chatRoom': chatRoom
            }

            // loop through all clients in the chat room and let them know that someone new has joined
            chatRoom.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payload))
            })

        }
    })
    // create unique id for the client who just connected to us
    const clientId = uuidv4().slice(0, 6);
    // set the client ids as the keys in our clients hash map
    clients[clientId] = {
        'connection': connection
    }

    // send response back to the client
    const payload = {
        'method': 'connect',
        'clientId': clientId
    }
    connection.send(JSON.stringify(payload)) // server and client are talking through JSON
})

const updateChatState = () => {
    for(const c in chatRooms) {
        const chatRoom = chatRooms[c]
        const payload = {
            'method': 'update',
            'chatRoom': chatRoom
        }

        chatRoom.clients.forEach(c => {
            clients[c.clientId].connection.send(JSON.stringify(payload))
        })
    }

    setTimeout(updateChatState, 500)
}
