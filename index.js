import tmi from 'tmi.js';
import axios from 'axios';

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true
  },
  channels: [ 'kalven013' ]
});

client.connect();

const gameQueue = [];
let isProcessingQueue = false;
const eventId = axios.get('http://192.168.0.223:8080').then(response => response.data.eventId);

client.on('message', (channel, tags, message, self) => {
  console.log(`${tags['display-name']}: ${message}`);
  scanMessage(message);
});

function scanMessage(message) {
  if (message.includes('!s')) {
    console.log('Keyword found!', message.split('!s ')[1]);
    const keyword = message.split('!s ')[1];
    addToGameQueue(keyword);
  }
}

function addToGameQueue(keyword) {
  gameQueue.push(keyword);
  
  // Start processing the queue if it's not already being processed
  if (!isProcessingQueue) {
    processGameQueue();
  }
}

function processGameQueue() {
  // Set flag to indicate queue is being processed
  isProcessingQueue = true;
  
  // If the queue is empty, we're done processing
  if (gameQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  // Take the first item from the queue
  const keyword = gameQueue[0];
  
  // Process the item
  console.log(eventId)
  axios.post('http://192.168.0.223:8080', { search: keyword, eventId: eventId })
    .then(response => {
      console.log('Game processed:', response);
      
      // Remove the processed item from the queue
      gameQueue.shift();
      
      // Process the next item if any
      processGameQueue();
    })
    .catch(error => {
      console.error('Error processing game:', error);
      
      // Remove the failed item from the queue to prevent blocking
      gameQueue.shift();
      
      // Continue with the next item
      processGameQueue();
    });
}
