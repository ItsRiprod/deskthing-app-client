import {
  Action,
  ActionReference,
  App,
  AppSettings,
  ClientManifest,
  EventMode,
  Key,
  KeyTrigger,
  LOGGING_LEVELS,
  SocketData,
  SongData,
} from "@deskthing/types";

type EventCallback = (data: SocketData) => void | Promise<void>;

export class DeskThingClass {
  private static instance: DeskThingClass;
  private manifest: ClientManifest | undefined;
  private listeners: { [key in string]?: EventCallback[] } = {};
  private onceListenerKeys: Set<string> = new Set()

  /**
   * Initializes the DeskThing instance and sets up event listeners.
   * Sends a message to the parent indicating that the client has started.
   * Also sets up a click event listener for buttons.
   * @version 0.10.4
   */
  constructor() {
    this.initialize();
    this.initializeListeners();
  }

  /**
   * Initializes the message event listener.
   * @private
   * @version 0.10.4
   */
  private initialize() {
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  /**
   * Sets up the listeners and bubbles them to the server
   * @private
   * @version 0.10.4
   */
  private async initializeListeners() {
    const eventsToForward = ["wheel", "keydown", "keyup"];
    const forwardEvent = (event: Event) => {
      // Check if event was prevented elsewhere
      if (event.defaultPrevented) {
        return;
      }

      // Check if it is a keyboard event and handle those differently
      if (event instanceof KeyboardEvent) {
        // Get the code for the key that was pressed
        const key = event.code;
        const mode =
          event.type === "keydown" ? EventMode.KeyDown : EventMode.KeyUp;
        this.triggerKey({ key, mode });
      } else if (event instanceof WheelEvent) {
        // Initialize the mode of the button press
        let mode = EventMode.ScrollUp;

        if (event.deltaY > 0) mode = EventMode.ScrollDown;
        else if (event.deltaY < 0) mode = EventMode.ScrollUp;
        else if (event.deltaX > 0) mode = EventMode.ScrollRight;
        else if (event.deltaX < 0) mode = EventMode.ScrollLeft;
        this.triggerKey({ key: "Scroll", mode });
      }
    };
    const options = {
      capture: true,
      passive: false,
    } as AddEventListenerOptions;

    eventsToForward.forEach((eventType) => {
      document.addEventListener(eventType, forwardEvent, options);
    });

    const fetchManifest = async () => {
      this.manifest = await this.fetchData<ClientManifest>("manifest", {
        type: "get",
        request: "manifest",
        app: "client",
      });
    };
    const handleManifest = async (socketData: SocketData) => {
      if (socketData.type == "manifest" && socketData.payload) {
        this.manifest = socketData.payload as ClientManifest;
      }
    };

    fetchManifest();

    this.on("manifest", handleManifest);
  }

  /**
   * Singleton pattern: Ensures only one instance of DeskThing exists.
   * @returns {DeskThingClass} The single instance of DeskThing
   * @version 0.10.4
   *
   * @example
   * const deskThing = DeskThing.getInstance();
   */
  static getInstance(): DeskThingClass {
    if (!this.instance) {
      this.instance = new DeskThingClass();
    }
    return this.instance;
  }

  /**
   * Registers an event listener for a specific event type.
   * @param {string} type - The type of event to listen for
   * @param {EventCallback} callback - The function to call when the event occurs
   * @returns {Function} A function to remove the event listener
   * @version 0.10.4
   *
   * @example
   * const removeListener = deskThing.on('music', (data: SocketData) => {
   *   console.log('Received music data:', data.payload);
   * });
   *
   * @example
   * // Client-side code (here)
   * const removeListener = deskThing.on('customdata', (data: SocketData) => {
   *   console.log('Received custom data:', data.payload);
   * });
   *
   * // Server-side code
   * DeskThing.send({ type: 'customdata', payload: 'Hello from the server!' });
   */
  on(type: string, callback: EventCallback): () => void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type]!.push(callback);
    return () => this.off(type, callback);
  }

  /**
   * Removes an event listener for a specific event type.
   * @param {string} type - The type of event to remove the listener from
   * @param {EventCallback} callback - The function to remove from the listeners
   * @version 0.10.4
   *
   * @example
   * deskThing.off('message', messageCallback);
   */
  off(type: string, callback: EventCallback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type]!.filter(
        (listener) => listener !== callback
      );
    }
  }

  /**
   * Handles incoming messages from the parent window.
   * @param {MessageEvent} event - The message event received
   * @private
   * @version 0.10.4
   */
  private handleMessage(event: MessageEvent) {
    // Return if the message is not from the deskthing
    if (event.data.source !== "deskthing") return;
    const socketData = event.data as SocketData;

    this.emit(socketData.type, socketData);
  }

  /**
   * Emits an event to all registered listeners for that event type.
   * @param {string} type - The type of event to emit
   * @param {SocketData} data - The data to pass to the event listeners
   * @returns {Promise<void>}
   * @private
   * @version 0.10.4
   */
  private async emit(type: string, data: SocketData): Promise<void> {
    const callbacks = this.listeners[type];
    if (callbacks) {
      const promises = callbacks.map(async (callback) => {
        try {
          await callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
      // Doesn't await for all of the callbacks to finish being run
      Promise.all(promises);
    }

    // Cleanup any listener keys if there are any
    const listenKey = `${type}-${data.request || 'undefined'}`
    const res = this.onceListenerKeys.delete(listenKey);
    if (res) {
      this.debug(`Removed callback key ${listenKey} because the callback was resolved`);
    }
  }
  /**
   * Listens for a single occurrence of an event, then removes the listener
   * @param {string} type - The event type to listen for
   * @param {EventCallback} callback - The function to call when the event occurs
   * @returns {Function} - Function to manually remove the listener
   * @version 0.10.4
   *
   * @example
   * deskThing.once('music', (data) => {
   *   console.log('Received music data:', data.payload);
   * });
   *
   * @example
   * // Client-side code (here)
   * deskThing.once('data', (data) => {
   *   console.log('Received specific request:', data.payload); // prints Payload 3 once
   * }, 'specificRequest');
   *
   *  // Server-side code
   * DeskThing.send({ type: 'data', payload: 'Payload 1', request: 'someRequest' }); // Wont send
   * DeskThing.send({ type: 'data', payload: 'Payload 2', request: 'randomRequest' }); // Wont send
   * DeskThing.send({ type: 'data', payload: 'Payload 3', request: 'specificRequest' }); // Will send
   * DeskThing.send({ type: 'data', payload: 'Payload 4', request: 'faultyRequest' }); // Wont send
   * DeskThing.send({ type: 'data', payload: 'Payload 5', request: 'specificRequest' }); // Wont send
   */
  public once(
    type: string,
    callback: EventCallback,
    request?: string
  ): () => void {
    const removeListener = this.on(type, (data) => {
      if (request && data.request !== request) return;
      callback(data);
      removeListener();
    });
    return removeListener;
  }

  /**
   * Asynchronously waits for a response after sending a request to the client
   * @param {SocketData} requestData - The data to send to initiate the request
   * @param {SocketData} listenFor - The response data pattern to listen for
   * @param {Function?} callback - Optional callback function to handle the response
   * @returns {Promise<t | undefined>} - The retrieved data, or undefined if the request fails or times out after 5 seconds
   * @version 0.10.4
   *
   * This will automatically return the payload of the response.
   *
   * @example
   * // On the client
   * const data = await DeskThing.fetch<UserProfile>(
   *            { type: 'get', request: 'profile', payload: { userId: '123' } },
   *            { type: 'users', request: 'update' }
   *         );
   *
   * console.log(data); // prints the user profile data
   *
   * // On the server
   * DeskThing.on('get', (data) => {
   *  if (data.request == 'profile') {
   *    DeskThing.send({
   *      type: 'users',
   *      payload: users.getUserById(data.payload.userId),
   *      request: 'update'
   *    })
   *  }
   * }
   *
   * @example
   * // On the client
   * DeskThing.fetch<UserProfile>(
   *   { type: 'get', request: 'profile', payload: { userId: '123' } },
   *   { type: 'users', request: 'update' }
   *   async (userData) => {{
   *      console.log(userData); // prints the user profile data
   *   }
   * );
   *
   *
   * // On the server
   * DeskThing.on('get', (data) => {
   *  if (data.request == 'profile') {
   *    DeskThing.send({
   *      type: 'users',
   *      payload: users.getUserById(data.payload.userId),
   *      request: 'update'
   *    })
   *  }
   * }
   */
  public fetch = async <T>(
    requestData: SocketData,
    listenFor: SocketData,
    callbackFn?: (data: T | undefined) => void | Promise<void>
  ): Promise<T | undefined> => {
    if (!requestData.type) {
      console.warn("Request data must have a type property");
      return undefined;
    }
    if (!listenFor.type) {
      console.warn("Listen for data must have a type property");
      return undefined;
    }

    const listenKey = `${listenFor.type}-${listenFor.request || 'undefined'}`

    const timeout = new Promise<undefined>((_, reject) => {
      setTimeout(
        () => {
          
          return reject(new Error(`Timed out waiting for response: type=${listenFor.type}, request=${listenFor.request || 'undefined'}`))
        },
        5000
      );
    });

    let removeListener: () => void | undefined;

    const dataPromise = new Promise<T>((resolve) => {
      // First setup the listener to avoid missing the response
      removeListener = this.once(
        listenFor.type,
        (data) => {
          this.onceListenerKeys.delete(listenKey);
          resolve(data.payload as T);
        },
        listenFor.request
      );
      // Send the request only if another process isn't already waiting on it
      // the onceListenerKey is removed upon the data being returned
      if (!this.onceListenerKeys.has(listenKey)) {
        this.send(requestData);
        this.onceListenerKeys.add(listenKey);
      }
    });

    const data = Promise.race([dataPromise, timeout]).catch((error) => {
      this.error(error);
      removeListener && removeListener();
      this.onceListenerKeys.delete(listenKey);
      return undefined;
    });

    if (callbackFn) {
      data.then(callbackFn);
    }
    return data;
  };

  /**
   * @deprecated Use {@link DeskThing.fetch} instead
   * Asynchronously waits for a response after sending a request to the client
   * @param {string} type - The type to listen to
   * @param {SocketData} requestData - The data to send that will be listened to
   * @param {string?} request (optional) A specific request to listen for
   * @returns {Promise<t | undefined>} - The retrieved data, or undefined if the request fails or times out after 5 seconds
   * @version 0.10.4
   *
   * This will automatically return the payload of the response.
   *
   * @example
   * // On the client
   * const data = await deskThing.fetchData<UserProfile>('users', {
   *   type: 'get',
   *   request: 'profile',
   *   payload: { userId: '123' }
   * });
   * console.log(data); // prints the user profile data
   *
   * // On the server
   * DeskThing.on('get', (data) => {
   *  if (data.request == 'profile') {
   *    DeskThing.send({
   *      type: 'users',
   *      payload: users.getUserById(data.payload.userId)
   *    })
   *  }
   * }
   */
  public fetchData = async <T>(
    type: string,
    requestData: SocketData,
    request?: string
  ): Promise<T | undefined> => {
    return this.fetch<T>(requestData, { type, request });
  };

  /**
   * Requests and waits for music data from the server
   * @returns {Promise<SongData | undefined>} - The retrieved music data, or undefined if the request fails
   * @version 0.10.4
   *
   * @example
   * const musicData = await deskThing.getMusic();
   * if (musicData) {
   *   console.log('Current song:', musicData.song_title);
   * }
   */
  public getMusic = async (): Promise<SongData | undefined> => {
    const musicData = await this.fetchData<SongData>("music", {
      app: "client",
      type: "get",
      request: "music",
      payload: {},
    });

    if (musicData && musicData.thumbnail) {
      musicData.thumbnail = this.formatImageUrl(musicData.thumbnail);
    }

    return musicData;
  };

  /**
   * Requests and waits for application settings from the server
   * @returns {Promise<AppSettings | undefined>} - The retrieved settings, or undefined if the request fails
   * @version 0.10.4
   *
   * @example
   * const settings = await deskThing.getSettings();
   * if (settings) {
   *   console.log('Theme:', settings.theme.value);
   *   console.log('Language:', settings.language.value);
   * }
   */
  public getSettings = async (): Promise<AppSettings | undefined> => {
    return this.fetchData("settings", {
      app: "client",
      type: "get",
      request: "settings",
      payload: {},
    });
  };

  /**
   * Requests and waits for the list of installed apps from the server
   * @returns {Promise<App[] | undefined>} - The retrieved apps list, or undefined if the request fails
   * @version 0.10.4
   *
   * @example
   * const installedApps = await deskThing.getApps();
   * if (installedApps) {
   *   installedApps.forEach(app => {
   *     console.log('App name:', app.name);
   *   });
   * }
   */
  public getApps = async (): Promise<App[] | undefined> => {
    return this.fetchData("apps", {
      app: "client",
      type: "get",
      request: "apps",
      payload: {},
    });
  };

  /**
   * Returns the URL for the action mapped to the key. Usually, the URL points to an SVG icon.
   * @param key
   * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
   * @version 0.10.4
   */
  public getKeyIcon = async (key: Key): Promise<string | undefined> => {
    return this.fetchData(key.id, {
      app: "client",
      type: "get",
      request: "key",
      payload: key,
    });
  };
  /**
   * Returns the URL for the action . Usually, the URL points to an SVG icon.
   * @param action
   * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
   * @version 0.10.4
   */
  public getActionIcon = async (
    action: Action
  ): Promise<string | undefined> => {
    return this.fetchData(action.id, {
      app: "client",
      type: "get",
      request: "action",
      payload: action,
    });
  };

  /**
   * Triggers an action as if it were triggered by a button
   * @param {ActionReference} action - The action to trigger
   * @param {string} action.id - The ID of the action
   * @param {string} [action.value] - Optional value for the action
   * @param {string} [action.source] - Optional source of the action (defaults to current app)
   * @version 0.10.4
   *
   * @example
   * // Trigger a simple action
   * deskThing.triggerAction({ id: 'do-something' });
   *
   * // Trigger an action with a value and custom source
   * deskThing.triggerAction({
   *   id: 'volup',
   *   value: '15',
   *   source: 'server'
   * });
   *
   * @example
   * // Trigger an action that modifies the client
   * deskThing.triggerAction({
   *   id: 'appslist',
   *   value: 'show',
   *   source: 'server'
   * });
   *
   * @example
   * // Trigger an action on your app
   * deskThing.triggerAction({
   *   id: 'service',
   *   value: 'restart'
   * });
   *
   * // Server-side code
   * DeskThing.on('action', (action) => {
   *   if (action.id === 'service') {
   *     console.log(action.value); // prints restart
   *   }
   * });
   */
  public triggerAction = async (action: ActionReference): Promise<void> => {
    this.send({ app: "client", type: "action", payload: action });
  };

  /**
   * Triggers the action tied to a specific key
   * @param {KeyTrigger} keyTrigger - The key trigger configuration
   * @param {string} keyTrigger.key - The key to trigger
   * @param {EventMode} keyTrigger.mode - The event mode (e.g., 'keydown', 'keyup')
   * @param {string} [keyTrigger.source] - Optional source of the key trigger (defaults to current app)
   *
   * @example
   * // Trigger a keydown event
   * deskThing.triggerKey({
   *   key: 'Enter',
   *   mode: EventMode.KeyDown,
   *   source: 'server'
   * });
   *
   * // Trigger a keyup event with custom source
   * deskThing.triggerKey({
   *   key: 'Escape',
   *   mode: EventMode.PressLong,
   *   source: 'server'
   * });
   */
  public triggerKey = async (keyTrigger: KeyTrigger): Promise<void> => {
    this.send({ app: "client", type: "key", payload: keyTrigger });
  };

  /**
   * Returns the manifest of the server
   * @returns {Promise<ClientManifest | undefined>} The manifest of the server, or undefined if the request fails
   */
  public getManifest = async (): Promise<ClientManifest | undefined> => {
    if (this.manifest) {
      return this.manifest;
    }

    return this.fetchData("manifest", {
      app: "client",
      type: "get",
      request: "manifest",
      payload: {},
    });
  };

  /**
   * Formats an image URL to make the returned string a usable src for an image
   * @param image - A legacy-acceptable image url that can be either base64 OR a url
   * @returns - a usable URL
   *
   * @example
   * //server
   * DeskThing.on('getImage', (socketData: SocketData) => {
   *    const imageUrl = await DeskThing.saveImageReferenceFromURL('https://host.com/some/image/url.png')
   *    DeskThing.send({ type: 'image', payload: imageUrl || '' })
   * })
   *
   * // client
   * const imageUrl = await DeskThing.fetchData<string>('image', { type: 'getImage' })
   * const formattedImage = DeskThing.formatImageUrl(imageUrl)
   * return <img src={formattedImage} alt="Image" />
   * @example
   * //server
   * const imageUrl = await DeskThing.saveImageReferenceFromURL(settings.image.value)
   * DeskThing.send({ type: 'image', payload: imageUrl || '' })
   *
   * // client
   * const [image, setImage] = useState<string>('')
   * const imageUrl = await DeskThing.on('image', (imageUrl) => {
   *   const formattedImage = DeskThing.formatImageUrl(imageUrl)
   *   setImage(formattedImage)
   * })
   * return <img src={image} alt="Image" />
   */
  public formatImageUrl = (image: string): string => {
    if (!this.manifest) {
      return image;
    }

    if (image.startsWith("data:image")) {
      return image;
    }

    return image.replace(
      "localhost:8891",
      `${this.manifest.ip}:${this.manifest.port}`
    );
  };

  /**
   * Sends a message to the parent window.
   * @param {SocketData} data - The data to send to the parent. "app" defaults to the current app
   * @deprecated Use send() instead
   * @example
   * deskThing.sendMessageToParent({
   *   app: 'client',
   *   type: 'action',
   *   payload: { buttonClicked: 'submit' }
   * });
   */
  public sendMessageToParent(data: SocketData) {
    this.send(data);
  }

  /**
   * Sends a message to the parent window.
   * @param {SocketData} data - The data to send to the parent. "app" defaults to the current app
   *
   * @example
   * deskThing.send({
   *   app: 'client',
   *   type: 'action',
   *   payload: { buttonClicked: 'submit' }
   * });
   */
  public send(data: SocketData) {
    const payload = {
      app: data.app || undefined,
      type: data.type || undefined,
      request: data.request || null,
      payload: data.payload || null,
    };
    window.parent.postMessage({ type: "IFRAME_ACTION", payload: payload }, "*");
  }

  /**
   * Logs the message in the console, the client, and the server
   * The extra data logged will not be bubbled anywhere but the console
   * 
   * @example
   * DeskThing.log(LOGGING_LEVELS.INFO, 'This is an info message', 'this is extra data');
   * // logs "[CLIENT]: This is an info message this is extra data" to the console
   * // logs "[YourApp] This is an info message" to the client
   * // logs "[CLIENT.YourApp] This is an info message" to the server
   */
  public log(level: LOGGING_LEVELS, message: string, ...extraData: any[]) {
    this.send({ app: "client", type: "log", request: level, payload: { message, data: [ ...extraData ] } });
  }

  /**
   * Logs the message in the console, the client, and the server
   * The extra data logged will not be bubbled anywhere but the console
   * 
   * @example
   * DeskThing.error('This is an error message', 'this is extra data');
   * // logs "[CLIENT]: This is an error message this is extra data" to the console
   * // logs "[YourApp] This is an error message" to the client
   * // logs "[CLIENT.YourApp] This is an error message" to the server
   */
  public error(message: string, ...extraData: any[]) {
    this.log(LOGGING_LEVELS.ERROR, message, ...extraData);
  }

  /**
   * Logs the message in the console, the client, and the server
   * The extra data logged will not be bubbled anywhere but the console
   * 
   * @example
   * DeskThing.warn('This is a warning message', 'this is extra data');
   * // logs "[CLIENT]: This is a warning message this is extra data" to the console
   * // logs "[YourApp] This is a warning message" to the client
   * // logs "[CLIENT.YourApp] This is a warning message" to the server
   */
  public warn(message: string, ...extraData: any[]) {
    this.log(LOGGING_LEVELS.WARN, message, ...extraData);
  }

  /**
   * Logs the message in the console, the client, and the server
   * The extra data logged will not be bubbled anywhere but the console
   * 
   * @example
   * DeskThing.debug('This is a debug message', 'this is extra data');
   * // logs "[CLIENT]: This is a debug message this is extra data" to the console
   * // logs "[YourApp] This is a debug message" to the client
   * // logs "[CLIENT.YourApp] This is a debug message" to the server
   */
  public debug(message: string, ...extraData: any[]) {
    this.log(LOGGING_LEVELS.DEBUG, message, ...extraData);
  }

  /**
   * Logs the message in the console, the client, and the server
   * The extra data logged will not be bubbled anywhere but the console
   * 
   * @example
   * DeskThing.fatal('This is a fatal message', 'this is extra data');
   * // logs "[CLIENT]: This is a fatal message this is extra data" to the console
   * // logs "[YourApp] This is a fatal message" to the client
   * // logs "[CLIENT.YourApp] This is a fatal message" to the server
   */
  public fatal(message: string, ...extraData: any[]) {
    this.log(LOGGING_LEVELS.FATAL, message, ...extraData);
  }

  /**
   * Logs the message in the console, the client, and the server
   * The extra data logged will not be bubbled anywhere but the console
   * 
   * @example
   * DeskThing.info('This is an info message', 'this is extra data');
   * // logs "[CLIENT]: This is an info message this is extra data" to the console
   * // logs "[YourApp] This is an info message" to the client
   * // logs "[CLIENT.YourApp] This is a fatal message" to the server
   */
  public info(message: string, ...extraData: any[]) {
    this.log(LOGGING_LEVELS.LOG, message, ...extraData);
  }
  

}

export const DeskThing = DeskThingClass.getInstance();
