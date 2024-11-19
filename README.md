# DeskThing Client NPM

The DeskThing-App is one of two required modules needed to make your own DeskThing App. It serves as a communication layer between your webpage and the rest of the client.

## Installation

To install the client, use the following command:

```sh
npm install deskthing-client
```

## Usage

### Initializing the DeskThing Client

To use the DeskThing client in your application, you need to import it and get an instance:

```typescript
import DeskThing from 'deskthing-client';

const deskThing = DeskThing.getInstance();
```

### Sending Messages to the Server

You can send messages to the server using the `send` method. For example, to send a JSON object to the server:

```typescript
deskThing.send({ type: 'set', payload: examplePayload });
```

### Receiving Messages on the Server

On the server side, you need to import the DeskThing server module and listen for events:

```typescript
import DeskThing from 'deskthing-server';

const deskThing = DeskThing.getInstance();

deskThing.on('set', (socketData) => {
console.log(socketData.payload);
});
```

### Example: Two-Way Communication

Here is a more complete example demonstrating two-way communication between the client and server:

#### Client Side

```typescript
import DeskThing from 'deskthing-client';

const deskThing = DeskThing.getInstance();

// Sending a message to the server
deskThing.send({ type: 'set', payload: { key: 'value' } });

// Listening for a response from the server
deskThing.on('response', (data) => {
  console.log('Received response from server:', data);
});
```

#### Server Side

```ts
import DeskThing from 'deskthing-server';

const deskThing = DeskThing.getInstance();

// Listening for a 'set' message from the client
deskThing.on('set', (socketData) => {
  console.log('Received payload:', socketData.payload);

  // Sending a response back to the client
  deskThing.sendDataToClient(socketData.socketId, {
    type: 'response',
    payload: { message: 'Data received successfully' }
  });
});
```

## Additional Information

For more detailed examples and intended implementations, please refer to the apps located at https://github.com/itsriprod/deskthing-apps 

