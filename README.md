# Deskthing Client NPM

The DeskThing-App is one of two required moduels needed to make your own DeskThing App. It serves as a communication layer between your webpage and the rest of the client. 

You can install it with
```
npm install deskthing-client
```

In brief, you will use the client to communicate with the rest of the application from your webpage. For instance, to send a JSON object to the server, you will do
```ts
import DeskThing from 'deskthing-client'

const deskThing = DeskThing.getInstance()

deskThing.sendMessageToServer({type: 'set', payload: examplePayload})
```

To receive this payload, you will need to have the following on your server
```ts
import DeskThing from 'deskthing-server'

const deskThing = DeskThing.getInstance()

deskThing.on('set', (socketData) => console.log(socketData.payload))
```

Keep in mind, this README is still in development and all the examples here should be taken lightly. The intended implementation can be found in the apps located at https://github.com/itsriprod/deskthing-apps 

