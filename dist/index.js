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
export class DeskThing {
    /**
     * Initializes the DeskThing instance and sets up event listeners.
     * Sends a message to the parent indicating that the client has started.
     * Also sets up a click event listener for buttons.
     */
    constructor() {
        this.listeners = {};
        this.initialize();
        document.addEventListener('keydown', (event) => {
            const key = event.code;
            this.sendMessageToParent({ app: 'client', type: 'button', payload: { button: key, flavor: 'Short' } });
        });
    }
    /**
     * Initializes the message event listener.
     * @private
     */
    initialize() {
        window.addEventListener('message', this.handleMessage.bind(this));
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
            this.sendMessageToParent({ app: 'client', request: event, type: 'on' });
            this.listeners[event].push(callback);
            return () => {
                this.sendMessageToParent({ app: 'client', request: event, type: 'off' });
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
     *
     * @example
     * deskThing.sendMessageToParent({
     *   app: 'client',
     *   type: 'action',
     *   payload: { buttonClicked: 'submit' }
     * });
     */
    sendMessageToParent(data) {
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
