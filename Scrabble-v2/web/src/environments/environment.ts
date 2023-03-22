// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    serverUrl: 'http://localhost:3000/api',
    firebase: {
        apiKey: 'AIzaSyDguzqyf-CHrommNaWB5kimou9WuPi4MTY',
        authDomain: 'polyscrabble-76a8b.firebaseapp.com',
        projectId: 'polyscrabble-76a8b',
        storageBucket: 'polyscrabble-76a8b.appspot.com',
        messagingSenderId: '469271159061',
        appId: '1:469271159061:web:0524d6581d0b0668c4091c',
        measurementId: 'G-NGR4RTDJSG',
        databaseURL: 'https://polyscrabble-76a8b-default-rtdb.firebaseio.com/',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
