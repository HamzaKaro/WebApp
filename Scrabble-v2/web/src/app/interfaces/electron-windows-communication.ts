/* eslint-disable @typescript-eslint/no-explicit-any */
// The chat window will send this interface in the main.js
// The purpose of this interface is to reduce the code dupplication in the main.js
export interface DataToMainWindow {
    socketEventToSend: string;
    socketEventDataToSend: any;
}

export interface DataToChatWindow {
    electronEvent: string;
    electronEventData: any;
}
