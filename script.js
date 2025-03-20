document.addEventListener("DOMContentLoaded", () => {
    let progress = 0;
    let progressText = document.getElementById("progress-text");
    let circle = document.querySelector(".progress-circle");

    function updateLoader() {
        if (progress <= 100) {
            progressText.textContent = `${progress}%`;
            circle.style.background = `conic-gradient(#00ff99 ${progress}%, #333 ${progress}%)`;
            progress++;
            setTimeout(updateLoader, 80); // Speed of progress
        } else {
            window.location.href = "home.html"; // Redirect when completed
        }
    }

    updateLoader();
});
