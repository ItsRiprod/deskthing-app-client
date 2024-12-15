export interface SocketData {
    app?: string;
    type: string;
    request?: string;
    payload?: any;
}
export interface ClientManifest {
    name: string;
    id: string;
    short_name: string;
    description: string;
    builtFor: string;
    reactive: boolean;
    author: string;
    version: string;
    version_code: number;
    compatible_server: number[];
    port: number;
    ip: string;
    device_type: {
        id: number;
        name: string;
    };
}
export interface ClientPreferences {
    miniplayer?: MiniplayerSettings;
    appTrayState: ViewMode;
    volume: VolMode;
    theme?: Theme;
    currentView?: App;
    ShowNotifications: boolean;
    Screensaver: App;
    ScreensaverType: ScreensaverSettings;
    onboarding: boolean;
    showPullTabs: boolean;
    saveLocation: boolean;
    use24hour: boolean;
}
export interface ScreensaverSettings {
    version: number;
    type: 'black' | 'logo' | 'clock';
}
export interface MiniplayerSettings {
    state: ViewMode;
    visible: boolean;
    position: 'bottom' | 'left' | 'right';
}
export interface Theme {
    primary: string;
    textLight: string;
    textDark: string;
    icons: string;
    background: string;
    scale: 'small' | 'medium' | 'large';
}
export declare enum VolMode {
    WHEEL = "wheel",
    SLIDER = "slider",
    BAR = "bar"
}
export declare enum ViewMode {
    HIDDEN = "hidden",
    PEEK = "peek",
    FULL = "full"
}
export type SongData = {
    album: string | null;
    artist: string | null;
    playlist: string | null;
    playlist_id: string | null;
    track_name: string;
    shuffle_state: boolean | null;
    repeat_state: 'off' | 'all' | 'track';
    is_playing: boolean;
    can_fast_forward: boolean;
    can_skip: boolean;
    can_like: boolean;
    can_change_volume: boolean;
    can_set_output: boolean;
    track_duration: number | null;
    track_progress: number | null;
    volume: number;
    thumbnail: string | null;
    device: string | null;
    id: string | null;
    device_id: string | null;
    color?: color;
};
interface color {
    value: number[];
    rgb: string;
    rgba: string;
    hex: string;
    hexa: string;
    isDark: boolean;
    isLight: boolean;
    error?: string;
}
export declare enum AUDIO_REQUESTS {
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
    SHUFFLE = "shuffle"
}
export interface Manifest {
    isAudioSource: boolean;
    requires: Array<string>;
    label: string;
    version: string;
    description?: string;
    author?: string;
    id: string;
    isWebApp: boolean;
    isLocalApp: boolean;
    platforms: Array<string>;
    homepage?: string;
    repository?: string;
}
export interface App {
    name: string;
    enabled: boolean;
    running: boolean;
    prefIndex: number;
    manifest?: Manifest;
}
export interface SettingsNumber {
    value: number;
    type: 'number';
    min: number;
    max: number;
    label: string;
    description?: string;
}
export interface SettingsBoolean {
    value: boolean;
    type: 'boolean';
    label: string;
    description?: string;
}
export interface SettingsRange {
    value: number;
    type: 'range';
    label: string;
    min: number;
    max: number;
    step?: number;
    description?: string;
}
export interface SettingsString {
    value: string;
    type: 'string';
    label: string;
    maxLength?: number;
    description?: string;
}
export interface SettingsSelect {
    value: string;
    type: 'select';
    label: string;
    description?: string;
    placeholder?: string;
    options: SettingOption[];
}
export type SettingOption = {
    label: string;
    value: string;
};
export interface SettingsList {
    value: string[];
    placeholder?: string;
    maxValues?: number;
    orderable?: boolean;
    unique?: boolean;
    type: 'list';
    label: string;
    description?: string;
    options: SettingOption[];
}
export interface SettingsRanked {
    value: string[];
    type: 'ranked';
    label: string;
    description?: string;
    options: SettingOption[];
}
export interface SettingsMultiSelect {
    value: string[];
    type: 'multiselect';
    label: string;
    description?: string;
    placeholder?: string;
    options: SettingOption[];
}
export interface SettingsColor {
    type: 'color';
    value: string;
    label: string;
    description?: string;
    placeholder?: string;
}
export type SettingsType = SettingsNumber | SettingsBoolean | SettingsString | SettingsSelect | SettingsMultiSelect | SettingsRange | SettingsRanked | SettingsList | SettingsColor;
export interface AppSettings {
    [key: string]: SettingsType;
}
export declare enum EventMode {
    KeyUp = 0,
    KeyDown = 1,
    ScrollUp = 2,
    ScrollDown = 3,
    ScrollLeft = 4,
    ScrollRight = 5,
    SwipeUp = 6,
    SwipeDown = 7,
    SwipeLeft = 8,
    SwipeRight = 9,
    PressShort = 10,
    PressLong = 11
}
export type Action = {
    name?: string;
    description?: string;
    id: string;
    value?: string;
    value_options?: string[];
    value_instructions?: string;
    icon?: string;
    source: string;
    version: string;
    enabled: boolean;
};
export type ActionReference = {
    id: string;
    value?: string;
    enabled?: boolean;
    source?: string;
};
export type Key = {
    id: string;
    source?: string;
    description?: string;
    version?: string;
    enabled?: boolean;
    version_code?: number;
    modes: EventMode[];
};
export interface KeyTrigger {
    key: string;
    mode: EventMode;
    source?: string;
}
type EventCallback = (data: SocketData) => void;
export declare class DeskThingClass {
    private static instance;
    private manifest;
    private listeners;
    /**
     * Initializes the DeskThing instance and sets up event listeners.
     * Sends a message to the parent indicating that the client has started.
     * Also sets up a click event listener for buttons.
     */
    constructor();
    /**
     * Initializes the message event listener.
     * @private
     */
    private initialize;
    /**
     * Sets up the listeners and bubbles them to the server
     * @private
     */
    private initializeListeners;
    /**
     * Singleton pattern: Ensures only one instance of DeskThing exists.
     * @returns {DeskThingClass} The single instance of DeskThing
     *
     * @example
     * const deskThing = DeskThing.getInstance();
     */
    static getInstance(): DeskThingClass;
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
    on(type: string, callback: EventCallback): () => void;
    /**
     * Removes an event listener for a specific event type.
     * @param {string} type - The type of event to remove the listener from
     * @param {EventCallback} callback - The function to remove from the listeners
     *
     * @example
     * deskThing.off('message', messageCallback);
     */
    off(type: string, callback: EventCallback): void;
    /**
     * Handles incoming messages from the parent window.
     * @param {MessageEvent} event - The message event received
     * @private
     */
    private handleMessage;
    /**
     * Emits an event to all registered listeners for that event type.
     * @param {string} type - The type of event to emit
     * @param {SocketData} data - The data to pass to the event listeners
     * @returns {Promise<void>}
     * @private
     */
    private emit;
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
    once(type: string, callback: EventCallback, request?: string): () => void;
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
    fetchData: <t>(type: string, requestData: SocketData, request?: string) => Promise<t | undefined>;
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
    getMusic: () => Promise<SongData | undefined>;
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
    getSettings: () => Promise<AppSettings | undefined>;
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
    getApps: () => Promise<App[] | undefined>;
    /**
     * Returns the URL for the action mapped to the key. Usually, the URL points to an SVG icon.
     * @param key
     * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
     */
    getKeyIcon: (key: Key) => Promise<string | undefined>;
    /**
     * Returns the URL for the action . Usually, the URL points to an SVG icon.
     * @param action
     * @returns {Promise<string | undefined>} - The URL for the action icon, or undefined if the request fails
     */
    getActionIcon: (action: Action) => Promise<string | undefined>;
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
    triggerAction: (action: ActionReference) => Promise<void>;
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
    triggerKey: (keyTrigger: KeyTrigger) => Promise<void>;
    /**
     * Returns the manifest of the current app
     * @returns {Promise<Manifest | undefined>} The manifest of the current app, or undefined if the request fails
     */
    getManifest: () => Promise<ClientManifest | undefined>;
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
    formatImageUrl: (image: string) => string;
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
    sendMessageToParent(data: SocketData): void;
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
    send(data: SocketData): void;
}
export declare const DeskThing: DeskThingClass;
export {};
