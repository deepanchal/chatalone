const firebaseConfig = {
  apiKey: "AIzaSyAW2g9Bi4yxQ-lwyLyAld1dyjbPMmP3Sx0",
  authDomain: "chatalone.firebaseapp.com",
  databaseURL: "https://chatalone.firebaseio.com",
  projectId: "chatalone",
  storageBucket: "chatalone.appspot.com",
  messagingSenderId: "318038830717",
  appId: "1:318038830717:web:af240fe30897dea01b8b14",
  measurementId: "G-NBC4WRSK24",
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.database();
