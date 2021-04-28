import React, { useEffect, useState } from 'react';

const App = () => {
	useEffect(() => document.body.classList.add('bg-blue-100'), []);

	const [showChatRoomID, setShowChatRoomID] = useState(false) // <boolean> is inferred

	const [hasEnteredChatRoom, setHasEnteredChatRoom] = useState(false) // <boolean> is inferred

	const joinChatRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setHasEnteredChatRoom(!hasEnteredChatRoom);
	}

	const generateNewChatRoomCode = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setShowChatRoomID(!showChatRoomID);
	}


	return (

		<main className='container'>
			<section className='row justify-content-center mt-5'>
				<div className='col-lg-7'>
					<form className='form-group border shadow bg-white font-weight-bold p-4'>

						{!hasEnteredChatRoom &&
							<>
								<h4 className='mb-5 text-center'>Welcome to My Websockets Project!</h4>

								<div>
									<input className='form-control bg-blue-200 input-shadow mb-2' placeholder='Enter Name' type='text' />
									<input className='form-control bg-blue-200 input-shadow' placeholder='Enter Your Six Digit Chat Room Code to Join!' type='text' />
									<button onClick={joinChatRoom} type='submit' className='btn btn-primary btn-shadow mt-3'>Join Chat Room</button>
								</div>

								<button onClick={generateNewChatRoomCode} type='submit' className='btn btn-primary btn-shadow mt-3'>Create New Chat Room</button>

								{/* show the generated chat room id */}
								{showChatRoomID &&
									<div>Show Chat Room ID</div>
								}
							</>
						}

						{hasEnteredChatRoom &&
							<div>You have entered a chat room!</div>
						}

					</form>
				</div>
			</section>
		</main>

	)
};

export default App;