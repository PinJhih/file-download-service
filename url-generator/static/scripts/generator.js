document.addEventListener("DOMContentLoaded", function () {
  const daysInput = document.getElementById("days");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");
  const generateButton = document.getElementById("generate-button");
  const expiryTimeSpan = document.getElementById("expiry-time");
  const shareUrlDiv = document.getElementById("share-url");
  const copyButton = document.getElementById("copy-button");
  const copyMessage = document.getElementById("copy-message");

  async function getDownloadLink(expiry) {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const result = await fetch(`/url/${fileName}/${expiry}`);
    const body = await result.json();
    return body.url;
  }

  async function updateExpiryTime() {
    const now = new Date();
    const days = parseInt(daysInput.value) || 0;
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const expiry = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;

    if (days === 0 && hours === 0 && minutes === 0) {
      alert("Please set a time greater than 0");
      return;
    }

    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + days);
    expiryDate.setHours(expiryDate.getHours() + hours);
    expiryDate.setMinutes(expiryDate.getMinutes() + minutes);

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };

    expiryTimeSpan.textContent = expiryDate.toLocaleString("en-US", options);

    const downloadLink = await getDownloadLink(expiry);
    shareUrlDiv.textContent = downloadLink;
  }

  // Handle generate button click
  generateButton.addEventListener("click", updateExpiryTime);

  // Handle copy button click
  // copyButton.addEventListener('click', function () {
  //     const textToCopy = shareUrlDiv.textContent;
  //     navigator.clipboard.writeText(textToCopy).then(function () {
  //         copyMessage.textContent = "Link copied to clipboard!";
  //         setTimeout(() => {
  //             copyMessage.textContent = "";
  //         }, 3000);
  //     }).catch(function (err) {
  //         console.error('Could not copy text: ', err);
  //         copyMessage.textContent = "Failed to copy. Please try again.";
  //     });
  // });

  // Input validation and constraints
  daysInput.addEventListener("change", function () {
    if (this.value < 0) this.value = 0;
    if (this.value > 30) this.value = 30;
  });

  hoursInput.addEventListener("change", function () {
    if (this.value < 0) this.value = 0;
    if (this.value > 23) this.value = 23;
  });

  minutesInput.addEventListener("change", function () {
    if (this.value < 0) this.value = 0;
    if (this.value > 59) this.value = 59;
  });
});
