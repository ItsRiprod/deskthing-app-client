
export interface SocketData {
    app?: string;
    type?: string;
    request?: string;
    payload?: any // I know this is bad and that you shouldn't use "any", but I'm not sure what else to do as this can literally be anything
  }


export type AppTypes = 'client' | 'server' | string;
export type EventTypes = 'get' | 'set' | 'message' | 'log' | 'error' | 'data' | 'apps' | 'message' | 'music' | 'settings' | string;

export type SongData = {
    album: string | null
    artist: string | null
    playlist: string | null
    playlist_id: string | null
    track_name: string
    shuffle_state: boolean | null
    repeat_state: 'off' | 'all' | 'track' //off, all, track
    is_playing: boolean
    can_fast_forward: boolean // Whether or not there an an option to 'fastforward 30 sec'
    can_skip: boolean
    can_like: boolean
    can_change_volume: boolean
    can_set_output: boolean 
    track_duration: number | null
    track_progress: number | null
    volume: number // percentage 0-100
    thumbnail: string | null //base64 encoding that includes data:image/png;base64, at the beginning
    device: string | null // Name of device that is playing the audio
    id: string | null // A way to identify the current song (is used for certain actions)
    device_id: string | null // a way to identify the current device if needed
  }

export enum AUDIO_REQUESTS {
  NEXT = "next",
  PREVIOUS = "previous",
  REWIND = "rewind",
  FAST_FORWARD = "fast_forward",
  PLAY = "play",
  PAUSE = "pause",
  SEEK = "seek",
  LIKE = "like",
  SONG = "song",
  VOLUME = "volume",
  REPEAT = "repeat",
  SHUFFLE = "shuffle",
}

export interface Manifest {
    isAudioSource: boolean
    requires: Array<string>
    label: string
    version: string
    description?: string
    author?: string
    id: string
    isWebApp: boolean
    isLocalApp: boolean
    platforms: Array<string>
    homepage?: string
    repository?: string
  }

export interface App {
    name: string
    enabled: boolean
    running: boolean
    prefIndex: number
    manifest?: Manifest
  }

  export interface SettingsNumber {
    value: number
    type: 'number'
    min: number
    max: number
    label: string
    description?: string
  }
  
  export interface SettingsBoolean {
    value: boolean
    type: 'boolean'
    label: string
    description?: string
  }
  
  export interface SettingsString {
    value: string
    type: 'string'
    label: string
    description?: string
  }
  
  export interface SettingsSelect {
    value: string
    type: 'select'
    label: string
    description?: string
    options: {
      label: string
      value: string
    }[]
  }
  
  export interface SettingsMultiSelect {
    value: boolean[]
    type: 'multiselect'
    label: string
    description?: string
    options: {
      label: string
    }[]
  }
  
  export type SettingsType =
    | SettingsNumber
    | SettingsBoolean
    | SettingsString
    | SettingsSelect
    | SettingsMultiSelect
  
  export interface AppSettings {
    [key: string]: SettingsType
  }

type EventCallback = (data: any) => void;

export class DeskThing {
    private static instance: DeskThing
    private listeners: { [key in AppTypes | EventTypes]?: EventCallback[] } = {};

    /**
     * Initializes the DeskThing instance and sets up event listeners.
     * Sends a message to the parent indicating that the client has started.
     * Also sets up a click event listener for buttons.
     */
    constructor() {
        this.initialize();
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            const key = event.code;
            this.sendMessageToParent({ app: 'client', type: 'button', payload: { button: key, flavor: 'Short' }});
        });
    }

    /**
     * Initializes the message event listener.
     * @private
     */
    private initialize() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    /**
     * Singleton pattern: Ensures only one instance of DeskThing exists.
     * @returns {DeskThing} The single instance of DeskThing
     * 
     * @example
     * const deskThing = DeskThing.getInstance();
     */
    static getInstance(): DeskThing {
        if (!this.instance) {
            this.instance = new DeskThing()
        }
        return this.instance
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
    on(event: EventTypes, callback: EventCallback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        if (event === 'apps' || event === 'message' || event === 'music' || event === 'settings') {
            this.sendMessageToParent({app: 'client', request: event, type: 'on'})

            this.listeners[event]!.push(callback);
            return () => {
                this.sendMessageToParent({app: 'client', request: event, type: 'off'})
                this.off(event, callback);
            }
        }

        this.listeners[event]!.push(callback);
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
    off(event: EventTypes, callback: EventCallback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event]!.filter(listener => listener !== callback);
        }
    }

    /**
     * Handles incoming messages from the parent window.
     * @param {MessageEvent} event - The message event received
     * @private
     */
    private handleMessage(event: MessageEvent) {
        // Return if the message is not from the deskthing
        if (event.data.source !== 'deskthing') return;
        const socketData = event.data

        if (socketData.app === 'client') {
            if (!socketData.type) return

            const callbacks = this.listeners[socketData.type]
            if (callbacks) {
                callbacks.forEach(callback => callback(socketData.payload));
            }

        } else {
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
    private async emit(event: AppTypes | EventTypes, data: SocketData): Promise<void> {
        const callbacks = this.listeners[event]
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
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
    public sendMessageToParent(data: SocketData) {
        const payload = {
            app: data.app || undefined,
            type: data.type || undefined,
            request: data.request || null,
            payload: data.payload || null
        };
        window.parent.postMessage(
            { type: 'IFRAME_ACTION', payload: payload }, '*'
        );
    }
}


export default DeskThing.getInstance();
