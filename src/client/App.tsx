import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const App = () => {
	useEffect(() => document.body.classList.add('bg-blue-100'), []);

	let ws = new W3CWebSocket('ws://localhost:8080');
	let clientId = null;
	let chatRoomId = null;

	const [name, setName] = useState('');
	const [chatRoomID, setChatRoomID] = useState('');
	const [showChatRoomID, setShowChatRoomID] = useState(false) // <boolean> is inferred
	const [hasEnteredChatRoom, setHasEnteredChatRoom] = useState(false)
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		// when the server sends the client a message
		ws.onmessage = message => {
			// message.data is the string the server has sent 
			// anything that comes from the server should be JSON
			const response = JSON.parse(message.data);

			// if you receive a response with the 'method': 'connect' from the server
			if (response.method === 'connect') {
				// set the clientId on the front end to be the same as the one received from the server so we can easily send it back to the server
				clientId = response.clientId
				console.log(`Client ID: ${clientId}`)
			}

			// if you receive a response with the 'method': 'create' from the server
			if (response.method === 'create') {
				chatRoomId = response.chatRoom.id
				console.log(`Chat Room successfully created with ID: ${chatRoomId}`)
			}

			// if you receive a response with the 'method': 'join' from the server
			if (response.method === 'join') {
				const chatRoom = response.chatRoom
			}

			console.log(response);
		}
	}, [])

	// if you don't enter a name or chat room code you can't enter one
	const joinChatRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		setName(name);

		// NOT WORKING
		if (chatRoomId === null && name === null) {
			alert('You must enter a Name and Chat Room Code')
			return;
		}

		const payload = {
			'method': 'join',
			'clientId': clientId,
			'chatRoomId': chatRoomId
		}
		ws.send(JSON.stringify(payload));

		setHasEnteredChatRoom(!hasEnteredChatRoom);
	}

	const generateNewChatRoomCode = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		// send this payload to the server when someone wants to create a new game
		const payload = {
			'method': 'create',
			'clientId': clientId
		}
		ws.send(JSON.stringify(payload))

		setShowChatRoomID(!showChatRoomID);
	}


	return (
		<>
			{!hasEnteredChatRoom &&
				<>
					<main className='container'>
						<section className='row justify-content-center mt-5'>
							<div className='col-lg-8'>

								<form className='form-group border shadow bg-white font-weight-bold p-4'>
									<h4 className='mb-5 text-center'>Welcome to My Websockets Project!</h4>

									<div className="d-flex flex-column align-items-center">
										<input className='form-control bg-blue-200 input-shadow mb-2' value={name} onChange={e => setName(e.target.value)} placeholder='Enter Name' type='text' />
										<input className='form-control bg-blue-200 input-shadow' value={chatRoomID} onChange={e => setChatRoomID(e.target.value)} placeholder='Enter Your Four Digit Chat Room Code to Join!' type='text' />
										<button onClick={joinChatRoom} type='submit' className='w-50 btn btn-primary btn-shadow mt-3'>Join Chat Room</button>
									</div>
								</form>

								<form className='form-group border shadow bg-white font-weight-bold p-4 mt-5'>
									<button onClick={generateNewChatRoomCode} type='submit' className='btn btn-primary btn-shadow'>Create New Chat Room</button>
									{/* show the generated chat room id */}
									{showChatRoomID &&
										<>
											<h2>{chatRoomId}</h2>
											<h6>Enter this code in the text field above to start chatting!</h6>
										</>
									}
								</form>

							</div>
						</section>
					</main>
				</>
			}

			{hasEnteredChatRoom &&
				<>
					<nav className='d-flex justify-content-between shadow bg-blue-900 text-white sticky-top p-3 mb-2'>
						<h1>Websockets Chat Room</h1>
						<button type='submit' className='btn btn-primary btn-shadow mt-3' onClick={() => setHasEnteredChatRoom(!hasEnteredChatRoom)}>Exit Chat Room</button>
					</nav>

					<main className='container'>
						<section className='row justify-content-center mt-5'>
							<div className='col-lg-12'>
								<form className='form-group border shadow bg-white font-weight-bold p-4'>
									<div>You have entered a chat room!</div>
								</form>
							</div>
						</section>
					</main>

					<div className="d-flex justify-content-center shadow bg-blue-900 text-white fixed-bottom p-3 mt-2 text-center">
						<input className='w-50 form-control bg-white input-shadow mr-2' value={message} onChange={e => setMessage(e.target.value)} placeholder='Enter Text Here' type='text' />
						<button type='submit' className='btn btn-primary btn-shadow' >Submit</button>
					</div>
				</>
			}
		</>
	)
};

export default App;