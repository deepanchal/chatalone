import { db, firestore } from "../services/firebase";

export function readChats() {
  let x = [];
  db.ref("chats").on("value", snapshot => {
    snapshot.forEach(snap => {
      x.push(snap.val())
    });
    return x;
  });
}

// export function writeChats(message) {
//   return db.ref("chats").push({
//     content: message.content,
//     uid: message.uid,
//     timestamp: message.timestamp,
//   });
// }

export function writeChats(message) {
  return firestore.collection('chats').add({
    content: message.content,
    uid: message.uid,
    timestamp: message.timestamp,
  });
}