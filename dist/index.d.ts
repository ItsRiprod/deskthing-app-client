export interface SocketData {
    app?: string;
    type?: string;
    request?: string;
    payload?: any;
}
export type AppTypes = 'client' | 'server' | string;
export type EventTypes = 'get' | 'set' | 'message' | 'log' | 'error' | 'data' | 'apps' | 'message' | 'music' | 'settings' | string;
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
};
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
export type SettingsType = SettingsNumber | SettingsBoolean | SettingsString | SettingsSelect | SettingsMultiSelect | SettingsRange | SettingsRanked;
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
type EventCallback = (data: any) => void;
export declare class DeskThing {
    private static instance;
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
     * @returns {DeskThing} The single instance of DeskThing
     *
     * @example
     * const deskThing = DeskThing.getInstance();
     */
    static getInstance(): DeskThing;
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
    on(event: EventTypes, callback: EventCallback): () => void;
    /**
     * Removes an event listener for a specific event type.
     * @param {EventTypes} event - The type of event to remove the listener from
     * @param {EventCallback} callback - The function to remove from the listeners
     *
     * @example
     * deskThing.off('message', messageCallback);
     */
    off(event: EventTypes, callback: EventCallback): void;
    /**
     * Handles incoming messages from the parent window.
     * @param {MessageEvent} event - The message event received
     * @private
     */
    private handleMessage;
    /**
     * Emits an event to all registered listeners for that event type.
     * @param {AppTypes | EventTypes} event - The type of event to emit
     * @param {SocketData} data - The data to pass to the event listeners
     * @returns {Promise<void>}
     * @private
     */
    private emit;
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
declare const _default: DeskThing;
export default _default;
