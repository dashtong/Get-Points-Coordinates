const body = document.body;
const dropArea = document.querySelector(".drag-area");
const dragText = dropArea.querySelector("header");
const browseButton = document.getElementById("browse-btn");
const input = dropArea.querySelector("input");

const originPositionButtonAreas = document.querySelectorAll(".origin-position-button-area");

const dimensionInputArea = document.querySelector(".dimension-input-area");
const dimensionWidth = document.getElementById("dimension-width");
const dimensionHeight = document.getElementById("dimension-height");

const textArea = document.querySelector(".text-area");
const copyButton = document.getElementById("copy-btn");
const codeBlock = document.getElementById("code-block");

const buttonArea = document.querySelector(".button-area");
const reloadButton = document.getElementById("reload-btn");
const resetButton = document.getElementById("reset-btn");

let file = null;
let fileobj = null;

const originMap = {"topLeft": "origin-position-1", "topRight": "origin-position-2", "bottomLeft": "origin-position-3", "bottimRight": "origin-position-4"};
let origin = originMap.topLeft;

browseButton.onclick = () => {
  input.click();
  file_browse();
}

reloadButton.onclick = () => {
  input.click();
  file_browse();
};

originPositionButtonAreas.forEach((area) => {
  const originButtons = area.querySelectorAll("button");
  originButtons.forEach((button) => {
    button.onclick = rerenderOriginButtons;
  });
})

input.addEventListener("change", function () {
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  file = this.files[0];
  if (file == null) { return; }
  dropArea.classList.add("active");
  showFile();
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("active");
  dragText.textContent = "Release to Upload File";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
  dragText.textContent = "Drag & Drop to Upload File";
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  file = event.dataTransfer.files[0];
  showFile();
});

function showFile() {
  let fileType = file.type;
  let validExtensions = ["image/jpeg", "image/jpg", "image/png"];
  if (validExtensions.includes(fileType)) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      let fileURL = fileReader.result;
      body.style.display = "grid";

      window.addEventListener('resize', resizeWindow);
      resizeWindow();
      originPositionButtonAreas.forEach((area) => {
        area.style.display = "flex";
        const originButtons = area.querySelectorAll("button");
        originButtons.forEach((button) => {
          button.innerHTML = AXIS_SVG;
        });
      });
      rerenderOriginButtons();
      textArea.style.display = "block";
      buttonArea.style.display = "block";
      dropArea.className = "drag-area-with-img";
      var image = new Image();
      image.src = fileURL;
      let imgTag = "";
      image.onload = function () {
        let widthHeightRatio = this.width / this.height;
        const length = 50;
        if (this.width >= this.height) {
          imgTag = `<img src="${fileURL}" alt="" style="width: 100%" id="uploadedImg">`;
          dropArea.style.width = `${length}em`;
          dropArea.style.height = `${length / widthHeightRatio}em`;
        }
        else {
          imgTag = `<img src="${fileURL}" alt="" style="height: 100%" id="uploadedImg">`;
          dropArea.style.height = `${length}em`;
          dropArea.style.width = `${widthHeightRatio * length}em`;
        }
        dropArea.innerHTML = imgTag + `<input type="file" name="file" id="file" hidden>`;
        createCanvas();
      };
    }
    fileReader.readAsDataURL(file);
  } else {
    alert("This is not a valid Image File!");
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  }
}

function upload_file(e) {
  e.preventDefault();
  fileobj = e.dataTransfer.files[0];
}

function file_browse() {
  document.getElementById('file').onchange = function () {
    fileobj = document.getElementById('file').files[0];
  };
}
function resizeWindow() {
  if (window.innerWidth > 1400) dimensionInputArea.style.display = "block";
  else dimensionInputArea.style.display = "flex";
}

function rerenderOriginButtons() {
  origin = this.id?? origin;
  originPositionButtonAreas.forEach((area) => {
    const originButtons = area.querySelectorAll("button");
    originButtons.forEach((button) => {
      button.style.backgroundColor = "";
    });
  })
  document.getElementById(origin).style.backgroundColor = "#5256ad";
  showInCodeBlock();
}



AXIS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30">
<image data-name="layer_1" width="30" height="30" xlink:href="data:img/png;base64,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"/>
</svg>`;