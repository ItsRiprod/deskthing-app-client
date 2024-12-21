var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var VolMode;
(function (VolMode) {
    VolMode["WHEEL"] = "wheel";
    VolMode["SLIDER"] = "slider";
    VolMode["BAR"] = "bar";
})(VolMode || (VolMode = {}));
export var ViewMode;
(function (ViewMode) {
    ViewMode["HIDDEN"] = "hidden";
    ViewMode["PEEK"] = "peek";
    ViewMode["FULL"] = "full";
})(ViewMode || (ViewMode = {}));
export var AUDIO_REQUESTS;
(function (AUDIO_REQUESTS) {
    AUDIO_REQUESTS["NEXT"] = "next";
    AUDIO_REQUESTS["PREVIOUS"] = "previous";
    AUDIO_REQUESTS["REWIND"] = "rewind";
    AUDIO_REQUESTS["FAST_FORWARD"] = "fast_forward";
    AUDIO_REQUESTS["PLAY"] = "play";
    AUDIO_REQUESTS["PAUSE"] = "pause";
    AUDIO_REQUESTS["SEEK"] = "seek";
    AUDIO_REQUESTS["LIKE"] = "like";
    AUDIO_REQUESTS["SONG"] = "song";
    AUDIO_REQUESTS["VOLUME"] = "volume";
    AUDIO_REQUESTS["REPEAT"] = "repeat";
    AUDIO_REQUESTS["SHUFFLE"] = "shuffle";
})(AUDIO_REQUESTS || (AUDIO_REQUESTS = {}));
export var EventMode;
(function (EventMode) {
    EventMode[EventMode["KeyUp"] = 0] = "KeyUp";
    EventMode[EventMode["KeyDown"] = 1] = "KeyDown";
    EventMode[EventMode["ScrollUp"] = 2] = "ScrollUp";
    EventMode[EventMode["ScrollDown"] = 3] = "ScrollDown";
    EventMode[EventMode["ScrollLeft"] = 4] = "ScrollLeft";
    EventMode[EventMode["ScrollRight"] = 5] = "ScrollRight";
    EventMode[EventMode["SwipeUp"] = 6] = "SwipeUp";
    EventMode[EventMode["SwipeDown"] = 7] = "SwipeDown";
    EventMode[EventMode["SwipeLeft"] = 8] = "SwipeLeft";
    EventMode[EventMode["SwipeRight"] = 9] = "SwipeRight";
    EventMode[EventMode["PressShort"] = 10] = "PressShort";
    EventMode[EventMode["PressLong"] = 11] = "PressLong";
})(EventMode || (EventMode = {}));
export class DeskThingClass {
    /**
     * Initializes the DeskThing instance and sets up event listeners.
     * Sends a message to the parent indicating that the client has started.
     * Also sets up a click event listener for buttons.
     */
    constructor() {
        this.listeners = {};
        /**
       * Asynchronously waits for a response after sending a request to the client
       * @param {string} type - The type to listen to
       * @param {SocketData} requestData - The data to send that will be listened to
       * @param {string?} request (optional) A specific request to listen for
       * @returns {Promise<t | undefined>} - The retrieved data, or undefined if the request fails or times out after 5 seconds
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
        this.fetchData = (type, requestData, request) => __awaiter(this, void 0, void 0, function* () {
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Music data request timed out')), 5000);
            });
            const dataPromise = new Promise((resolve) => {
                this.once(type, (data) => {
                    resolve(data.payload);
                }, request);
                this.send(requestData);
            });
            return Promise.race([dataPromise, timeout])
                .catch(() => undefined);
        });
        /**
         * Requests and waits for music data from the server
         * @returns {Promise<SongData | undefined>} - The retrieved music data, or undefined if the request fails
         *
         * @example
         * const musicData = await deskThing.getMusic();
         * if (musicData) {
         *   console.log('Current song:', musicData.song_title);
         * }
         */
        this.getMusic = () => __awaiter(this, void 0, void 0, function* () {
            const musicData = yield this.fetchData('music', {
                app: 'client',
                type: 'get',
                request: 'music',
                payload: {}
            });
            if (musicData && musicData.thumbnail) {
                musicData.thumbnail = this.formatImageUrl(musicData.thumbnail);
            }
            return musicData;
        });
        /**
       * Requests and waits for application settings from the server
       * @returns {Promise<AppSettings | undefined>} - The retrieved settings, or undefined if the request fails
       *
       * @example
       * const settings = await deskThing.getSettings();
       * if (settings) {
       *   console.log('Theme:', settings.theme.value);
       *   console.log('Language:', settings.language.value);
       * }
       */
        this.getSettings = () => __awaiter(this, void 0, void 0, function* () {
            return this.fetchData('settings', {
                app: 'client',
                type: 'get',
                request: 'settings',
                payload: {}
            });
        });
        /**
       * Requests and waits for the list of installed apps from the server
       * @returns {Promise<App[] | undefined>} - The retrieved apps list, or undefined if the request fails
       *
       * @example
       * const installedApps = await deskThing.getApps();
       * if (installedApps) {
       *   installedApps.forEach(app => {
       *     console.log('App name:', app.name);
       *   });
       * }
       */
        this.getApps = () => __awaiter(this, void 0, void 0, function* () {
            return this.fetchData('apps', {
                app: 'client',
                type: 'get',
                request: 'apps',
                payload: {}
            });
        });
        /**
         * Returns the URL for the action mapped to the key. Usually, the URL points to an SVG icon.
         * @param key
         * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
         */
        this.getKeyIcon = (key) => __awaiter(this, void 0, void 0, function* () {
            return this.fetchData(key.id, {
                app: 'client',
                type: 'get',
                request: 'key',
                payload: key
            });
        });
        /**
         * Returns the URL for the action . Usually, the URL points to an SVG icon.
         * @param action
         * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
         */
        this.getActionIcon = (action) => __awaiter(this, void 0, void 0, function* () {
            return this.fetchData(action.id, {
                app: 'client',
                type: 'get',
                request: 'action',
                payload: action
            });
        });
        /**
       * Triggers an action as if it were triggered by a button
       * @param {ActionReference} action - The action to trigger
       * @param {string} action.id - The ID of the action
       * @param {string} [action.value] - Optional value for the action
       * @param {string} [action.source] - Optional source of the action (defaults to current app)
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
        this.triggerAction = (action) => __awaiter(this, void 0, void 0, function* () {
            this.send({ app: 'client', type: 'action', payload: action });
        });
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
        this.triggerKey = (keyTrigger) => __awaiter(this, void 0, void 0, function* () {
            this.send({ app: 'client', type: 'key', payload: keyTrigger });
        });
        /**
         * Returns the manifest of the current app
         * @returns {Promise<Manifest | undefined>} The manifest of the current app, or undefined if the request fails
         */
        this.getManifest = () => __awaiter(this, void 0, void 0, function* () {
            if (this.manifest) {
                return this.manifest;
            }
            return this.fetchData('manifest', {
                app: 'client',
                type: 'get',
                request: 'manifest',
                payload: {}
            });
        });
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
        this.formatImageUrl = (image) => {
            if (!this.manifest) {
                return image;
            }
            if (image.startsWith('data:image')) {
                return image;
            }
            return image.replace('localhost:8891', `${this.manifest.ip}:${this.manifest.port}`);
        };
        this.initialize();
        this.initializeListeners();
    }
    /**
     * Initializes the message event listener.
     * @private
     */
    initialize() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }
    /**
     * Sets up the listeners and bubbles them to the server
     * @private
     */
    initializeListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            const eventsToForward = ['wheel', 'keydown', 'keyup'];
            const forwardEvent = (event) => {
                // Check if event was prevented elsewhere
                if (event.defaultPrevented) {
                    return;
                }
                // Check if it is a keyboard event and handle those differently
                if (event instanceof KeyboardEvent) {
                    // Get the code for the key that was pressed
                    const key = event.code;
                    const mode = event.type === 'keydown' ? EventMode.KeyDown : EventMode.KeyUp;
                    this.triggerKey({ key, mode });
                }
                else if (event instanceof WheelEvent) {
                    // Initialize the mode of the button press
                    let mode = EventMode.ScrollUp;
                    if (event.deltaY > 0)
                        mode = EventMode.ScrollDown;
                    else if (event.deltaY < 0)
                        mode = EventMode.ScrollUp;
                    else if (event.deltaX > 0)
                        mode = EventMode.ScrollRight;
                    else if (event.deltaX < 0)
                        mode = EventMode.ScrollLeft;
                    this.triggerKey({ key: 'Scroll', mode });
                }
            };
            const options = { capture: true, passive: false };
            eventsToForward.forEach(eventType => {
                document.addEventListener(eventType, forwardEvent, options);
            });
            const fetchManifest = () => __awaiter(this, void 0, void 0, function* () {
                this.manifest = yield this.fetchData('manifest', { type: 'get', request: 'manifest', app: 'client' });
            });
            const handleManifest = (socketData) => __awaiter(this, void 0, void 0, function* () {
                if (socketData.type == 'manifest' && socketData.payload) {
                    this.manifest = socketData.payload;
                }
            });
            fetchManifest();
            this.on('manifest', handleManifest);
        });
    }
    /**
     * Singleton pattern: Ensures only one instance of DeskThing exists.
     * @returns {DeskThingClass} The single instance of DeskThing
     *
     * @example
     * const deskThing = DeskThing.getInstance();
     */
    static getInstance() {
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
    on(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
        return () => this.off(type, callback);
    }
    /**
     * Removes an event listener for a specific event type.
     * @param {string} type - The type of event to remove the listener from
     * @param {EventCallback} callback - The function to remove from the listeners
     *
     * @example
     * deskThing.off('message', messageCallback);
     */
    off(type, callback) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type].filter(listener => listener !== callback);
        }
    }
    /**
     * Handles incoming messages from the parent window.
     * @param {MessageEvent} event - The message event received
     * @private
     */
    handleMessage(event) {
        // Return if the message is not from the deskthing
        if (event.data.source !== 'deskthing')
            return;
        const socketData = event.data;
        this.emit(socketData.type, socketData);
    }
    /**
     * Emits an event to all registered listeners for that event type.
     * @param {string} type - The type of event to emit
     * @param {SocketData} data - The data to pass to the event listeners
     * @returns {Promise<void>}
     * @private
     */
    emit(type, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const callbacks = this.listeners[type];
            if (callbacks) {
                callbacks.forEach(callback => callback(data));
            }
        });
    }
    /**
   * Listens for a single occurrence of an event, then removes the listener
   * @param {string} type - The event type to listen for
   * @param {EventCallback} callback - The function to call when the event occurs
   * @returns {Function} - Function to manually remove the listener
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
    once(type, callback, request) {
        const removeListener = this.on(type, (data) => {
            if (request && data.request !== request)
                return;
            callback(data);
            removeListener();
        });
        return removeListener;
    }
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
    sendMessageToParent(data) {
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
    send(data) {
        const payload = {
            app: data.app || undefined,
            type: data.type || undefined,
            request: data.request || null,
            payload: data.payload || null
        };
        window.parent.postMessage({ type: 'IFRAME_ACTION', payload: payload }, '*');
    }
}
export const DeskThing = DeskThingClass.getInstance();
