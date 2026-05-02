(() => {
  const state = {
    cvReady: false,
    items: [],
    index: 0,
    sessionId: `session_${Date.now()}`,
  };

  const elements = {
    fileInput: document.getElementById("file-input"),
    startBtn: document.getElementById("start-btn"),
    uploadError: document.getElementById("upload-error"),

    labelView: document.getElementById("label-view"),
    labelTitle: document.getElementById("label-title"),
    labelMeta: document.getElementById("label-meta"),
    progress: document.getElementById("progress"),
    originalImg: document.getElementById("original-img"),
    binaryImg: document.getElementById("binary-img"),

    prevBtn: document.getElementById("prev-btn"),
    saveBtn: document.getElementById("save-btn"),
    rejectBtn: document.getElementById("reject-btn"),
    labelInput: document.getElementById("label-input"),

    doneView: document.getElementById("done-view"),
    totalStat: document.getElementById("total-stat"),
    labelledStat: document.getElementById("labelled-stat"),
    rejectedStat: document.getElementById("rejected-stat"),
    downloadBtn: document.getElementById("download-btn"),
    restartBtn: document.getElementById("restart-btn"),
  };

  const showUploadError = (message) => {
    elements.uploadError.textContent = message;
    elements.uploadError.classList.remove("hidden");
  };

  const clearUploadError = () => {
    elements.uploadError.textContent = "";
    elements.uploadError.classList.add("hidden");
  };

const safeLabelFolder = (label) => {
    const trimmed = (label || "").trim();
    if (!trimmed) return "unknown";

    // Explicitly tag letters to prevent Windows folder merging
    if (/^[a-z]$/.test(trimmed)) return `${trimmed}_lower`;
    if (/^[A-Z]$/.test(trimmed)) return `${trimmed}_upper`;

    // Numbers and basic safe characters remain untouched
    if (/^[0-9_-]$/.test(trimmed)) return trimmed;

    // Fallback for special symbols (converts to hex)
    const code = trimmed.codePointAt(0);
    return `symbol_u${code.toString(16)}`;
  };

  const canvasToBlob = (canvas, type = "image/png") =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        resolve(blob);
      }, type);
    });

  const matToBlob = async (mat) => {
    const canvas = document.createElement("canvas");
    canvas.width = mat.cols;
    canvas.height = mat.rows;
    cv.imshow(canvas, mat);
    return canvasToBlob(canvas);
  };

  const preprocessSingleBlob = async (blob) => {
    if (!state.cvReady) {
      return blob;
    }

    const imageBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const blur = new cv.Mat();
    const binary = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blur, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
    cv.threshold(blur, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

    const outBlob = await matToBlob(binary);
    src.delete();
    gray.delete();
    blur.delete();
    binary.delete();
    return outBlob;
  };

  const segmentImageBlob = async (blob) => {
    if (!state.cvReady) {
      const binaryBlob = await preprocessSingleBlob(blob);
      return [{ originalBlob: blob, binaryBlob, sourceName: "single-image" }];
    }

    const imageBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const blur = new cv.Mat();
    const binary = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blur, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
    cv.threshold(blur, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const boxes = [];
    for (let i = 0; i < contours.size(); i += 1) {
      const contour = contours.get(i);
      const rect = cv.boundingRect(contour);
      contour.delete();
      if (rect.width > 8 && rect.width < 120 && rect.height > 15 && rect.height < 180) {
        boxes.push(rect);
      }
    }

    boxes.sort((a, b) => a.x - b.x);

    if (!boxes.length) {
      const fallbackBinary = await matToBlob(binary);
      src.delete();
      gray.delete();
      blur.delete();
      binary.delete();
      contours.delete();
      hierarchy.delete();
      return [{ originalBlob: blob, binaryBlob: fallbackBinary, sourceName: "single-image" }];
    }

    const items = [];
    for (const rect of boxes) {
      const roiOriginal = src.roi(rect);
      const roiBinary = binary.roi(rect);
      const originalBlob = await matToBlob(roiOriginal);
      const binaryBlob = await matToBlob(roiBinary);
      roiOriginal.delete();
      roiBinary.delete();
      items.push({
        originalBlob,
        binaryBlob,
        sourceName: "single-image",
      });
    }

    src.delete();
    gray.delete();
    blur.delete();
    binary.delete();
    contours.delete();
    hierarchy.delete();

    return items;
  };

  const extractImagesFromZip = async (zipFile) => {
    const zip = await JSZip.loadAsync(zipFile);
    const entries = Object.values(zip.files);
    const imageEntries = entries.filter((entry) => {
      if (entry.dir) return false;
      return /\.(png|jpg|jpeg|bmp|webp|tif|tiff)$/i.test(entry.name);
    });

    const results = [];
    for (const entry of imageEntries) {
      const originalBlob = await entry.async("blob");
      const binaryBlob = await preprocessSingleBlob(originalBlob);
      results.push({
        originalBlob,
        binaryBlob,
        sourceName: entry.name,
      });
    }
    return results;
  };

  const buildItemsInitial = (rawItems) => {
    return rawItems.map((item, i) => ({
      index: i,
      sourceName: item.sourceName,
      originalBlob: item.originalBlob,
      binaryBlob: item.binaryBlob,
      finalLabel: null,
      rejected: false,
    }));
  };

  const showLabelView = async () => {
    const item = state.items[state.index];
    if (!item) {
      finishSession();
      return;
    }

    elements.doneView.classList.add("hidden");
    elements.labelView.classList.remove("hidden");

    elements.labelTitle.textContent = `Character ${state.index + 1} / ${state.items.length}`;
    elements.progress.max = state.items.length;
    elements.progress.value = state.index + 1;
    elements.labelMeta.textContent = `Source: ${item.sourceName}`;

    elements.originalImg.src = URL.createObjectURL(item.originalBlob);
    elements.binaryImg.src = URL.createObjectURL(item.binaryBlob);

    // Auto-focus and pre-fill if returning to an already labelled item
    elements.labelInput.value = item.finalLabel || "";
    elements.labelInput.focus();
  };

  const finishSession = () => {
    const labelledCount = state.items.filter((item) => !!item.finalLabel).length;
    const rejectedCount = state.items.filter((item) => item.rejected).length;

    elements.labelView.classList.add("hidden");
    elements.doneView.classList.remove("hidden");
    elements.totalStat.textContent = String(state.items.length);
    elements.labelledStat.textContent = String(labelledCount);
    elements.rejectedStat.textContent = String(rejectedCount);
  };

  const moveNext = () => {
    state.index += 1;
    if (state.index >= state.items.length) {
      finishSession();
      return;
    }
    showLabelView();
  };

  const movePrevious = () => {
    if (state.index > 0) {
      state.index -= 1;
      showLabelView();
    }
  };

  const saveCurrent = () => {
    const value = elements.labelInput.value.trim();
    if (!value || value.length !== 1 || !/\S/.test(value)) {
      showUploadError("Enter exactly one visible character for the label.");
      return;
    }
    clearUploadError();
    const item = state.items[state.index];
    item.finalLabel = value;
    item.rejected = false;
    moveNext();
  };

  const rejectCurrent = () => {
    const item = state.items[state.index];
    item.rejected = true;
    item.finalLabel = null;
    elements.labelInput.value = "";
    moveNext();
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    let fileCount = 0;

    for (const item of state.items) {
      if (!item.finalLabel) continue;
      const folderName = safeLabelFolder(item.finalLabel);
      const fileName = `${state.sessionId}_char_${String(item.index).padStart(4, "0")}.png`;
      zip.file(`characters/${folderName}/${fileName}`, item.originalBlob);
      zip.file(`characters_binary/${folderName}/${fileName}`, item.binaryBlob);
      fileCount += 2;
    }

    if (!fileCount) {
      zip.file("README.txt", "No labels were saved in this session.");
    }

    const outBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(outBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `labelled_${state.sessionId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startSession = async () => {
    clearUploadError();

    const file = elements.fileInput.files?.[0];
    if (!file) {
      showUploadError("Please select an image or zip file.");
      return;
    }

    elements.startBtn.disabled = true;
    elements.startBtn.textContent = "Processing...";

    try {
      let rawItems = [];

      if (/\.zip$/i.test(file.name)) {
        rawItems = await extractImagesFromZip(file);
        if (!rawItems.length) {
          showUploadError("No valid images found inside zip.");
          return;
        }
      } else {
        rawItems = await segmentImageBlob(file);
      }

      state.sessionId = `session_${Date.now()}`;
      state.items = buildItemsInitial(rawItems);
      state.index = 0;

      if (!state.items.length) {
        showUploadError("No characters found to label.");
        return;
      }

      await showLabelView();
    } catch (error) {
      showUploadError(error?.message || "Failed to start session.");
    } finally {
      elements.startBtn.disabled = false;
      elements.startBtn.textContent = "Start Labeling";
    }
  };

  const restartSession = () => {
    state.items = [];
    state.index = 0;
    elements.labelView.classList.add("hidden");
    elements.doneView.classList.add("hidden");
    elements.fileInput.value = "";
    clearUploadError();
  };

  const bindEvents = () => {
    elements.startBtn.addEventListener("click", startSession);
    elements.prevBtn.addEventListener("click", movePrevious);
    elements.saveBtn.addEventListener("click", saveCurrent);
    elements.rejectBtn.addEventListener("click", rejectCurrent);
    elements.downloadBtn.addEventListener("click", downloadZip);
    elements.restartBtn.addEventListener("click", restartSession);

    document.addEventListener("keydown", (event) => {
      if (elements.labelView.classList.contains("hidden")) return;

      const isTyping = event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA";

      if (isTyping) {
        if (event.key === "Enter") saveCurrent();
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "r") rejectCurrent();
      if (key === "p" || event.key === "ArrowLeft") movePrevious();
    });
  };

  const waitForOpenCv = () => {
    const intervalId = setInterval(() => {
      if (window.cv && typeof window.cv.Mat === "function") {
        clearInterval(intervalId);
        state.cvReady = true;
      }
    }, 200);

    setTimeout(() => {
      if (!state.cvReady) {
        clearInterval(intervalId);
      }
    }, 10000);
  };

  const init = () => {
    bindEvents();
    waitForOpenCv();
  };

  init();
})();