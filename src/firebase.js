import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";



var firebaseConfig = {
    apiKey: "AIzaSyDRNUnYLSZev2cCQ9WHknef1R_r-mDVvos",
    authDomain: "react-slack-clone-d6022.firebaseapp.com",
    projectId: "react-slack-clone-d6022",
    storageBucket: "react-slack-clone-d6022.appspot.com",
    messagingSenderId: "284799989894",
    appId: "1:284799989894:web:eaa0ebad422c4afcc6f907",
    measurementId: "G-WZ9JS3RXBL"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // firebase.analytics();


  export default firebase;