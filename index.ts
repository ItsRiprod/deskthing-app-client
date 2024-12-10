
export interface SocketData {
    app?: string;
    type: string;
    request?: string;
    payload?: any // I know this is bad and that you shouldn't use "any", but I'm not sure what else to do as this can literally be anything
  }

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
    color?: color
  }

  interface color {
    value: number[]
    rgb: string
    rgba: string
    hex: string
    hexa: string
    isDark: boolean
    isLight: boolean
    error?: string
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
  
  export interface SettingsRange {
    value: number
    type: 'range'
    label: string
    min: number
    max: number
    step?: number
    description?: string
  }
  
  export interface SettingsString {
    value: string
    type: 'string'
    label: string
    maxLength?: number
    description?: string
  }
  
  export interface SettingsSelect {
    value: string
    type: 'select'
    label: string
    description?: string
    placeholder?: string
    options: SettingOption[]
  }
  
  export type SettingOption = {
    label: string
    value: string
  }

  export interface SettingsList {
    value: string[]
    placeholder?: string
    maxValues?: number
    orderable?: boolean
    unique?: boolean
    type: 'list'
    label: string
    description?: string
    options: SettingOption[]
  }
  
  export interface SettingsRanked {
    value: string[]
    type: 'ranked'
    label: string
    description?: string
    options: SettingOption[]
  }
  
  export interface SettingsMultiSelect {
    value: string[]
    type: 'multiselect'
    label: string
    description?: string
    placeholder?: string
    options: SettingOption[]
  }

  export interface SettingsColor {
    type: 'color'
    value: string
    label: string
    description?: string
    placeholder?: string
  }


  
  export type SettingsType =
    | SettingsNumber
    | SettingsBoolean
    | SettingsString
    | SettingsSelect
    | SettingsMultiSelect
    | SettingsRange
    | SettingsRanked
    | SettingsList
    | SettingsColor
  
  export interface AppSettings {
    [key: string]: SettingsType
  }

  export enum EventMode {
    KeyUp,
    KeyDown,
    ScrollUp,
    ScrollDown,
    ScrollLeft,
    ScrollRight,
    SwipeUp,
    SwipeDown,
    SwipeLeft,
    SwipeRight,
    PressShort,
    PressLong
  }

  export type Action = {
    name?: string // User Readable name
    description?: string // User Readable description
    id: string // System-level ID
    value?: string // The value to be passed to the action. This is included when the action is triggered
    value_options?: string[] // The options for the value
    value_instructions?: string // Instructions for the user to set the value
    icon?: string // The name of the icon the action uses - if left blank, the action will use the icon's id
    source: string // The origin of the action
    version: string // The version of the action
    enabled: boolean // Whether or not the app associated with the action is enabled
  }

  export type ActionReference = {
    id: string
    value?: string
    enabled?: boolean
    source?: string
  }

  export type Key = {
    id: string // System-level ID
    source?: string // The origin of the key
    description?: string // User Readable description
    version?: string //  The version of the key
    enabled?: boolean // Whether or not the app associated with the key is enabled
    version_code?: number // The version of the server the action is compatible with
    modes: EventMode[] // The Modes of the key
  }

  export interface KeyTrigger {
    key: string
    mode: EventMode
    source?: string
  }

type EventCallback = (data: SocketData) => void;

export class DeskThing {
    private static instance: DeskThing
    private listeners: { [key in string]?: EventCallback[] } = {};

    /**
     * Initializes the DeskThing instance and sets up event listeners.
     * Sends a message to the parent indicating that the client has started.
     * Also sets up a click event listener for buttons.
     */
      constructor() {
          this.initialize();
          this.initializeListeners();
      }
    /**
     * Initializes the message event listener.
     * @private
     */
    private initialize() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    /**
     * Sets up the listeners and bubbles them to the server
     * @private
     */
    private async initializeListeners() {
      const eventsToForward = ['wheel', 'keydown', 'keyup'];
          const forwardEvent = (event: Event) => {

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
            } else if (event instanceof WheelEvent) {
              
              // Initialize the mode of the button press
              let mode = EventMode.ScrollUp;
              
              if (event.deltaY > 0) mode = EventMode.ScrollDown;
              else if (event.deltaY < 0) mode = EventMode.ScrollUp;
              else if (event.deltaX > 0) mode = EventMode.ScrollRight;
              else if (event.deltaX < 0) mode = EventMode.ScrollLeft;
              this.triggerKey({ key: 'Scroll', mode });
            }
          }
          const options = { capture: true, passive: false } as AddEventListenerOptions;
        
          eventsToForward.forEach(eventType => {
              document.addEventListener(eventType, forwardEvent, options);
          });
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
     * 
     * @example
     * deskThing.off('message', messageCallback);
     */
    off(type: string, callback: EventCallback) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type]!.filter(listener => listener !== callback);
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
        const socketData = event.data as SocketData

        this.emit(socketData.type, socketData);
    }

    /**
     * Emits an event to all registered listeners for that event type.
     * @param {string} type - The type of event to emit
     * @param {SocketData} data - The data to pass to the event listeners
     * @returns {Promise<void>}
     * @private
     */
    private async emit(type: string, data: SocketData): Promise<void> {
        const callbacks = this.listeners[type]
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
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
      public once(type: string, callback: EventCallback, request?: string): () => void {
          const removeListener = this.on(type, (data) => {
              if (request && data.request !== request) return
              callback(data)
              removeListener()
          })
          return removeListener
      }

    
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
      public fetchData = async <t>(type: string, requestData: SocketData, request?: string): Promise<t | undefined> => {
        const timeout = new Promise<undefined>((_, reject) => {
            setTimeout(() => reject(new Error('Music data request timed out')), 5000);
        });
      
        const dataPromise = new Promise<t>((resolve) => {
            this.once(type, (data) => {
                resolve(data.payload as t);
            }, request);
            this.send(requestData);
        });
  
        return Promise.race([dataPromise, timeout])
            .catch(() => undefined);
      };
    
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
      public getMusic = async (): Promise<SongData | undefined> => {
        return this.fetchData('music', {
          app: 'client',
          type: 'get',
          request: 'music',
          payload: {}
        })
      };
    
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
      public getSettings = async (): Promise<AppSettings | undefined> => {
        return this.fetchData('settings', {
          app: 'client',
          type: 'get',
          request: 'settings',
          payload: {}
        })
      };
    
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
      public getApps = async (): Promise<App[] | undefined> => {
        return this.fetchData('apps', {
          app: 'client',
          type: 'get',
          request: 'apps',
          payload: {}
        })
      };

      /**
       * Returns the URL for the action mapped to the key. Usually, the URL points to an SVG icon.
       * @param key 
       * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
       */
      public getKeyIcon = async (key: Key): Promise<string | undefined> => {
        return this.fetchData(key.id, {
          app: 'client',
          type: 'get',
          request: 'key',
          payload: key
        })
      }
      /**
       * Returns the URL for the action . Usually, the URL points to an SVG icon.
       * @param action
       * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
       */
      public getActionIcon = async (action: Action): Promise<string | undefined> => {
        return this.fetchData(action.id, {
          app: 'client',
          type: 'get',
          request: 'action',
          payload: action
        })
      }

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
      public triggerAction = async (action: ActionReference): Promise<void> => {
        this.send({ app: 'client', type: 'action', payload: action});
      }

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
        this.send({ app: 'client', type: 'key', payload: keyTrigger});
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
    public sendMessageToParent(data: SocketData) {
        this.send(data)
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
            payload: data.payload || null
        };
        window.parent.postMessage(
            { type: 'IFRAME_ACTION', payload: payload }, '*'
        );
    }
}


export default DeskThing.getInstance();
