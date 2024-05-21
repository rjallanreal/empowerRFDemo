import paho.mqtt.client as mqtt
import subprocess

# Define the MQTT settings
MQTT_BROKER = "127.0.0.1"  # Replace with your MQTT broker address
MQTT_PORT = 1883
MQTT_TOPIC = "frequency/topic"
pid = -1
# Define the callback function for when a message is received
def on_message(client, userdata, message):
    global pid
    if (pid != -1):
        process = subprocess.Popen(['kill', '-9', str(pid)])
    print(f"Received message '{message.payload.decode()}' on topic '{message.topic}'")
    process = subprocess.Popen(['/usr/local/bin/python3', 'top_block.py', '--freq', str(message.payload.decode())])
    pid = process.pid

# Create an MQTT client instance
client = mqtt.Client()

# Assign the on_message callback function
client.on_message = on_message

# Connect to the MQTT broker
client.connect(MQTT_BROKER, MQTT_PORT)

# Subscribe to the topic
client.subscribe(MQTT_TOPIC)

# Start the MQTT client loop to process network traffic and dispatch callbacks
client.loop_forever()