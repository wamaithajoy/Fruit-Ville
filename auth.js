// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";  // ✅ UPDATED: Added getDoc for user retrieval
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyCLfyTVSV7s7mErfdQsAte6JIWe7VdqkvM",
    authDomain: "fruit-village-7a9af.web.app",
    projectId: "fruit-village-7a9af",
    storageBucket: "fruit-village-7a9af.firebasestorage.app",
    messagingSenderId: "900590829227",
    appId: "1:900590829227:web:02d69db769d95fd66d41ee",
    measurementId: "G-QBCDLRBGED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Function to open the modal
function openAuthModal() {
    document.getElementById("authModal").style.display = "flex";
}

// Function to close the modal
function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
}

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
    const authBtn = document.querySelector(".auth-btn");
    const profileIcon = document.querySelector(".profile-icon");
    const authModal = document.getElementById("authModal");
    const closeBtn = document.querySelector(".close-btn");

    // Form elements
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("createAccount");
    const googleSignupBtn = document.getElementById("googleSignUp");

    // Switch between login and signup
    const switchToLogin = document.getElementById("switchToLogin");
    const switchToSignup = document.getElementById("switchToSignup");

    // Password toggles
    const passwordToggleIcons = document.querySelectorAll(".toggle-password");

    // Signup & login sections
    const signupSection = document.querySelector(".signup-section");
    const loginSection = document.querySelector(".login-section");

    // Initially hide modal
    authModal.style.display = "none";

    // ✅ UPDATED: Fetch user data from Firestore on login
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            authBtn.style.display = "none";
            profileIcon.style.display = "block";

            try {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    profileIcon.src = userDoc.data().profilePicture || "default-avatar.png";
                } else {
                    profileIcon.src = user.photoURL || "default-avatar.png"; 
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                profileIcon.src = user.photoURL || "default-avatar.png";  
            }
        }
    });

    // Show modal when login/signup button is clicked
    authBtn.addEventListener("click", openAuthModal);

    // Close modal when close button is clicked
    closeBtn.addEventListener("click", closeAuthModal);

    // Handle Login
    loginBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please fill in all fields!");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Login Successful!");
                console.log("User:", userCredential.user);
                closeAuthModal();
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // ✅ UPDATED SIGNUP FUNCTION
    signupBtn.addEventListener("click", async function (e) {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const fileInput = document.getElementById("profileImage");

        if (!email || !password || !confirmPassword) {
            alert("Please fill in all fields!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Step 1: Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let imageUrl = "joyy.jpg"; // Default image if no upload

            // Step 2: Upload Image if Selected
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const storageRef = ref(storage, `profile_images/${user.uid}`);
                await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Step 3: Update Profile Picture in Firebase Auth
            await updateProfile(user, { photoURL: imageUrl });

            // Step 4: Store User Data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                profilePicture: imageUrl,
            });

            // Step 5: Show Profile Picture in UI
            profileIcon.src = imageUrl;
            profileIcon.style.display = "block";

            alert("Account Created Successfully!");
            console.log("User:", user);
            closeAuthModal();
        } catch (error) {
            alert(error.message);
            console.error("Error:", error);
        }
    });

    // Google Sign-In
    googleSignupBtn.addEventListener("click", function () {
        signInWithPopup(auth, provider)
            .then((result) => {
                alert("Google Sign-In Successful!");
                console.log("User:", result.user);
                closeAuthModal();
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Logout when clicking profile icon
    profileIcon.addEventListener("click", function () {
        signOut(auth).then(() => {
            window.location.reload();
        });
    });

    // Toggle Password Visibility
    passwordToggleIcons.forEach((icon) => {
        icon.addEventListener("click", function () {
            const input = this.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    // Switch to Login Form
    switchToLogin.addEventListener("click", function (e) {
        e.preventDefault();
        signupSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // Switch to Signup Form
    switchToSignup.addEventListener("click", function (e) {
        e.preventDefault();
        signupSection.style.display = "block";
        loginSection.style.display = "none";
    });
    

});

document.addEventListener("DOMContentLoaded", function() {
    const circles = document.querySelectorAll(".circle-item");
    const infoBox = document.querySelector(".info-box");
    const infoText = document.getElementById("info-text");
    const closeButton = document.querySelector(".close");
    const carousel = document.querySelector(".carousel");

    let isDragging = false;
    let startX, currentX;
    let activeIndex = 2; // The default selected circle (center one)

    // Function to update circle positions in a curved manner
    function updateCirclePositions() {
        const positions = [
            { top: "60px", left: "20px" },
            { top: "20px", left: "110px" },
            { top: "0", left: "210px" },
            { top: "20px", left: "310px" },
            { top: "60px", left: "400px" }
        ];

        circles.forEach((circle, index) => {
            circle.style.top = positions[index].top;
            circle.style.left = positions[index].left;
            circle.classList.remove("active");
        });

        circles[activeIndex].classList.add("active");
        infoText.textContent = circles[activeIndex].getAttribute("data-info");
    }

    // Function to move to the next or previous circle
    function moveCarousel(direction) {
        if (direction === "next") {
            activeIndex = (activeIndex + 1) % circles.length;
        } else if (direction === "prev") {
            activeIndex = (activeIndex - 1 + circles.length) % circles.length;
        }
        updateCirclePositions();
    }

    // Mouse Drag Events
    carousel.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        let difference = currentX - startX;

        if (difference > 50) {
            moveCarousel("prev");
            isDragging = false;
        } else if (difference < -50) {
            moveCarousel("next");
            isDragging = false;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Touch Events (for mobile)
    carousel.addEventListener("touchstart", (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        let difference = currentX - startX;

        if (difference > 50) {
            moveCarousel("prev");
            isDragging = false;
        } else if (difference < -50) {
            moveCarousel("next");
            isDragging = false;
        }
    });

    carousel.addEventListener("touchend", () => {
        isDragging = false;
    });

    // Click Event to Show Info Box
    circles.forEach((circle, index) => {
        circle.addEventListener("click", function() {
            activeIndex = index;
            updateCirclePositions();
            infoBox.style.display = "block";
        });
    });

    closeButton.addEventListener("click", function() {
        infoBox.style.display = "none";
    });

    // Initial position setup
    updateCirclePositions();
});

