import zmq

def main():
    # Create a ZeroMQ context
    context = zmq.Context()

    # Create a PULL socket
    socket = context.socket(zmq.PULL)
    socket.bind("tcp://127.0.0.1:5555")

    print("Listening for messages on tcp://127.0.0.1:5555...")

    while True:
        # Receive a message
        message = socket.recv_string()
        print(f"Received message: {message}")

if __name__ == "__main__":
    main()