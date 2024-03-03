
copyButton.onclick = () => {
    // Change to checked svg and Revert back after 2 seconds
    const currentSVG = copyButton.querySelector("svg");
    const secondSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
    </svg>
  `;
    copyButton.innerHTML = secondSVG;
    setTimeout(function () {
        copyButton.innerHTML = currentSVG.outerHTML;
    }, 2000);
    
    const textToCopy = codeBlock.innerText;
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy.replace("Points:\n","");
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand("copy");

    document.body.removeChild(textarea);

    alert("Text copied to clipboard!");
};