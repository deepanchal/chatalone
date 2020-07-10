import { auth, db } from "../services/firebase";

export function signup(email, password) {
  return auth().createUserWithEmailAndPassword(email, password);
}

export function updateDisplayName(name) {
  if (auth().currentUser) {
    return auth()
      .currentUser.updateProfile({
        displayName: name,
      })
      .then(
        function (response) {
          console.log("Updated", response);
        },
        function (error) {
          console.log(error);
        }
      );
  }
}

export function addUserToDB() {
  const u = auth().currentUser;
  return db.ref("users/" + u.uid).set({
    email: u.email,
    uid: u.uid,
    uname: u.displayName,
  });
}

export function signin(email, password) {
  return auth().signInWithEmailAndPassword(email, password);
}

export function logout() {
  return auth().signOut();
}

export function signInWithGoogle() {
  const provider = new auth.GoogleAuthProvider();
  return auth()
    .signInWithPopup(provider)
    .then(function (result) {
      console.log(result.additionalUserInfo.isNewUser);
      if (result.additionalUserInfo.isNewUser) addUserToDB();
    });
}

export function signInWithGitHub() {
  const provider = new auth.GithubAuthProvider();
  return auth()
    .signInWithPopup(provider)
    .then(function (result) {
      console.log(result.additionalUserInfo.isNewUser);
      if (result.additionalUserInfo.isNewUser) addUserToDB();
    });
}
