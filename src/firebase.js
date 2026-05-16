import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyJwNtV2u7uD87ighYworJKJ8PLZPkfZs",
  authDomain: "regen-os.firebaseapp.com",
  projectId: "regen-os",
  storageBucket: "regen-os.firebasestorage.app",
  messagingSenderId: "835942448087",
  appId: "1:835942448087:web:ad7eff53e48c88fc1ca992"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {

  const result = await signInWithPopup(
    auth,
    provider
  );

  const user = result.user;

  if (!user.email.endsWith("@regenplastic.com")) {

    await signOut(auth);

    alert("Access allowed only for @regenplastic.com");

    throw new Error("Unauthorized domain");

  }

  return user;

}

export async function logout() {

  await signOut(auth);

}