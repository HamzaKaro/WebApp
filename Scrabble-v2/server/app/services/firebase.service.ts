import 'reflect-metadata';
import { Service } from 'typedi';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref } from 'firebase/database';
import { getFirestore } from 'firebase/firestore/lite';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

// Initialize Realtime Database and get a reference to the service

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyDguzqyf-CHrommNaWB5kimou9WuPi4MTY',
    authDomain: 'polyscrabble-76a8b.firebaseapp.com',
    projectId: 'polyscrabble-76a8b',
    storageBucket: 'polyscrabble-76a8b.appspot.com',
    messagingSenderId: '469271159061',
    appId: '1:469271159061:web:0524d6581d0b0668c4091c',
    measurementId: 'G-NGR4RTDJSG',
    databaseURL: 'https://polyscrabble-76a8b-default-rtdb.firebaseio.com/',
};

// Initialize Firebase

@Service()
export class Firebase {
    app: FirebaseApp;

    constructor() {
        this.app = initializeApp(firebaseConfig);
        // eslint-disable-next-line no-console
        console.log('Firebase connected');
    }
    auth() {
        return getAuth(this.app);
    }
    db() {
        // realTimeDB
        return getDatabase();
    }
    dbRef() {
        // reference of realTimeDB
        return ref(getDatabase());
    }
    dbStore() {
        // Firestore
        return getFirestore(this.app);
    }
}
