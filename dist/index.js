var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export class DeskThing {
    /**
     * Initializes the DeskThing instance and sets up event listeners.
     * Sends a message to the parent indicating that the client has started.
     * Also sets up a click event listener for buttons.
     */
    constructor() {
        this.listeners = {};
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
                    // 'bubble' the event to the server. 'flavor' is depreciated but used for backwards-compatibility. Will be removed in a future update.
                    const mode = event.type === 'keydown' ? 'KeyDown' : 'KeyUp';
                    const flavor = event.type === 'keydown' ? 'Down' : 'Up';
                    this.send({ app: 'client', type: 'button', payload: { button: key, mode, flavor } });
                    this.send({ app: 'client', type: 'button', payload: { button: key, mode, flavor } });
                    // There should be logic for long presses, but those are not supported yet!
                }
                else if (event instanceof WheelEvent) {
                    // Initialize the mode of the button press
                    let mode = 'Up';
                    if (event.deltaY > 0)
                        mode = 'Down';
                    else if (event.deltaY < 0)
                        mode = 'Up';
                    else if (event.deltaX > 0)
                        mode = 'Right';
                    else if (event.deltaX < 0)
                        mode = 'Left';
                    // Added "flavor" for backwards compatibility. It's not needed in later versions
                    this.send({ app: 'client', type: 'button', payload: { button: 'Scroll', flavor: mode, mode } });
                }
            };
            const options = { capture: true, passive: false };
            eventsToForward.forEach(eventType => {
                document.addEventListener(eventType, forwardEvent, options);
            });
        });
    }
    /**
     * Singleton pattern: Ensures only one instance of DeskThing exists.
     * @returns {DeskThing} The single instance of DeskThing
     *
     * @example
     * const deskThing = DeskThing.getInstance();
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new DeskThing();
        }
        return this.instance;
    }
    /**
     * Registers an event listener for a specific event type.
     * @param {EventTypes} event - The type of event to listen for
     * @param {EventCallback} callback - The function to call when the event occurs
     * @returns {Function} A function to remove the event listener
     *
     * @example
     * const removeListener = deskThing.on('message', (data) => {
     *   console.log('Received message:', data);
     * });
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        if (event === 'apps' || event === 'message' || event === 'music' || event === 'settings') {
            this.send({ app: 'client', request: event, type: 'on' });
            this.listeners[event].push(callback);
            return () => {
                this.send({ app: 'client', request: event, type: 'off' });
                this.off(event, callback);
            };
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback);
    }
    /**
     * Removes an event listener for a specific event type.
     * @param {EventTypes} event - The type of event to remove the listener from
     * @param {EventCallback} callback - The function to remove from the listeners
     *
     * @example
     * deskThing.off('message', messageCallback);
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(listener => listener !== callback);
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
        if (socketData.app === 'client') {
            if (!socketData.type)
                return;
            const callbacks = this.listeners[socketData.type];
            if (callbacks) {
                callbacks.forEach(callback => callback(socketData.payload));
            }
        }
        else {
            this.emit(socketData.app, socketData);
        }
    }
    /**
     * Emits an event to all registered listeners for that event type.
     * @param {AppTypes | EventTypes} event - The type of event to emit
     * @param {SocketData} data - The data to pass to the event listeners
     * @returns {Promise<void>}
     * @private
     */
    emit(event, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const callbacks = this.listeners[event];
            if (callbacks) {
                callbacks.forEach(callback => callback(data));
            }
        });
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
export default DeskThing.getInstance();
