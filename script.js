// ========= Global ==========
const workspace = document.querySelector(".workspace");
const docSection = `
  <div class="doc-section container">
    <h3>Why Choose Our Tool?</h3>
    <ul>
      <li><strong>Secure:</strong> All processing happens on your device — no files are ever uploaded to servers.</li>
      <li><strong>Premium Experience:</strong> Every user is treated as a premium user — enjoy all features without paywalls.</li>
      <li><strong>Unlimited Access:</strong> Perform unlimited conversions, merges, and edits effortlessly.</li>
    </ul>
  </div>
`;
// ========= Tool Templates ==========
const tools = {
  allMerge: `
<div class="container">

<h1>
<i class="fa-solid fa-layer-group"></i>
All-in-One PDF Merger
</h1>

<label class="dropZone" id="allMergeDrop" for="allMergeFiles">
Drag & Drop PDFs or Images
</label>

<input
type="file"
id="allMergeFiles"
multiple
accept=".pdf,image/*"
/>

<div class="input-group">
<label>Output PDF Name</label>
<input
type="text"
id="allMergeName"
value="merged.pdf"
placeholder="merged.pdf"
/>
</div>

<button id="allMergeBtn">
Generate PDF
</button>

<div id="allMergeStatus" class="status"></div>

<div id="allMergeList" class="file-list"></div>

</div>
`,
  merge: `
<div class="container">
  <h1><i class="fa-solid fa-code-merge"></i> Merge PDF Files</h1>
  <label class="dropZone" id="mergeDropZone" for="mergePdfFiles">
    Drag & Drop or Click to Upload PDF Files
  </label>
  <input type="file" id="mergePdfFiles" multiple accept=".pdf" />
  <button id="mergeGenerateBtn">Generate Merged PDF</button>
  <div id="mergeStatus" class="status"></div>
  <div id="mergeFileList"></div>
</div>

  `,

  split: `
    <div class="container">
      <h1><i class="fa-solid fa-arrows-split-up-and-left"></i>  Split PDF File</h1>
      <label class="dropZone" for="splitPdf">Select or Drop a PDF File</label>
      <input type="file" id="splitPdf" accept=".pdf" />
      <button id="splitBtn">Split PDF</button>
      <div id="status" class="status"></div>
    </div>
  `,

  pdfToWord: `
    <div class="container">
      <h1><i class="fa-solid fa-file-word"></i> PDF ➜ Word Converter</h1>
      <label class="dropZone" for="pdfFiles">Select or Drop PDF File</label>
      <input type="file" id="pdfFiles" accept=".pdf" />
      <button id="convertBtn">Convert to Word</button>
      <div id="status"></div>
    </div>
  `,

  wordToPdf: `
    <div class="container">
      <h1><i class="fa-solid fa-file-word"></i> Word ➜ PDF Converter</h1>
      <label class="dropZone" for="docFiles">Select or Drop Word Files</label>
      <input type="file" id="docFiles" multiple accept=".doc,.docx" />
      <button id="convertBtn">Convert to PDF</button>
      <div id="status"></div>
    </div>
  `,

  pdfToExcel: `
    <div class="container">
      <h1><i class="fa-solid fa-file-excel"></i> PDF ➜ Excel Converter</h1>
      <label class="dropZone" for="pdfToExcelFiles">Select or Drop PDF File</label>
      <input type="file" id="pdfToExcelFiles" accept=".pdf" />
      <button id="convertBtn">Convert to Excel</button>
      <div id="status"></div>
    </div>
  `,

  excelToPdf: `
    <div class="container">
      <h1><i class="fa-solid fa-file-excel"></i> Excel ➜ PDF Converter</h1>
      <label class="dropZone" for="excelFiles">Select Excel Files</label>
      <input type="file" id="excelFiles" multiple accept=".xls,.xlsx" />
      <button id="convertBtn">Convert to PDF</button>
      <div id="status"></div>
    </div>
  `,

  jpgToPdf: `
<div class="container" id="jpgToPdfContainer">
  <h1><i class="fa-solid fa-file-image"></i> JPG ➜ PDF Converter</h1>

  <label class="dropZone" id="jpgDropZone" for="jpgFiles">Drag and drop or Click to Select Image Files</label>
  <input type="file" id="jpgFiles" multiple accept=".jpg,.jpeg,.png" />
  <button id="convertBtn">Convert to PDF</button>

  <div class="merge-option">
    <input type="checkbox" id="mergeJpgs" />
    <label for="mergeJpgs">Merge all images into one PDF</label>
  </div>
  
  <div id="jpgFileList" class="file-list"></div>

  <div id="status"></div>
</div>
  `,
  pdfToJpg: `
<div class="container">
  <h1><i class="fa-solid fa-file-image"></i> PDF ➜ JPG Converter</h1>

  <label class="dropZone" id="pdfDropZone" for="pdfToJpgInput">
    Drop or Select PDF
  </label>
  <input type="file" id="pdfToJpgInput" accept=".pdf" />

  <div id="pdfFileList" class="file-list"></div>

  <button id="convertToJpgBtn">Convert to JPG</button>
  <div id="status" class="status"></div>
</div>
`,
  pdfEditor: `
<!-- Put these where your page expects the tool -->
<div class="container">
  <h1>PDF Text Editor</h1>
  <p>Drag & drop or select PDF(s). Click text to edit, drag to move, resize with corner, then Save.</p>

  <div id="dropZone" class="dropZone">
    <p>Drop PDFs here or click to choose</p>
    <input id="pdfEditorFile" type="file" accept=".pdf" multiple hidden />
  </div>

  <div id="previewContainer" class="preview-container"></div>

  <div class="actions">
    <label>Font size: <input id="fontSizeInput" type="number" value="12" min="6" max="72" /></label>
    <button id="saveEditedPdf">Save Edited & Merged PDF</button>
  </div>
</div>

  `,

  organizer: `
    <div class="container">
      <h1>PDF Organizer</h1>
      <p>Add, Delete, Rotate, or Reorder Pages</p>
      <input type="file" id="pdfOrgFile" accept=".pdf" />
      <div id="organizeTools">
        <button id="addPage">Add Page</button>
        <button id="deletePage">Delete Page</button>
        <button id="rotatePage">Rotate</button>
        <button id="reorderPage">Reorder</button>
      </div>
    </div>
  `,
  compressPdf: `
<div class="container">
  <h1><i class="fa-solid fa-file-zipper"></i> Compress PDF</h1>

  <label class="dropZone" id="pdfCompressDrop" for="pdfCompressInput">
    Drag & Drop or Click to Upload PDFs
  </label>

  <input type="file" id="pdfCompressInput" multiple accept=".pdf" />

  <div class="input-group">
    <label>Target Size (KB)</label>
    <input type="number" id="pdfTargetSize" placeholder="Enter size in KB" />
  <label style="display:none;" >
  <input type="checkbox" id="forcePortrait">
  Force Portrait Mode
</label>
  </div>


  <button id="compressPdfBtn">Compress PDFs</button>

  <div id="pdfCompressStatus" class="status"></div>
  <div id="pdfCompressList" class="file-list"></div>

</div>
`,

  compressImg: `
<div class="container">
  <h1><i class="fa-solid fa-image"></i> Compress Images</h1>

  <label class="dropZone" id="imgCompressDrop" for="imgCompressInput">
    Drag & Drop or Click to Upload Images
  </label>

  <input type="file" id="imgCompressInput" multiple accept="image/*" />

  <div class="input-group">
    <label>Target Size (KB)</label>
    <input type="number" id="imgTargetSize" placeholder="Enter size in KB" />
  </div>


  <button id="compressImgBtn">Compress Images</button>

  <div id="imgCompressStatus" class="status"></div>
  <div id="imgCompressList" class="file-list"></div>

</div>
`,
};

// ========= Initialization ==========
function loadTool(toolName) {
  workspace.innerHTML =
    tools[toolName] + docSection ||
    `<div class="container"><h1>Tool Coming Soon!</h1></div>`;
  initTool(toolName);
}

// helper to map visible text -> tool id (same logic you had)
function getToolIdFromText(text) {
  text = text.toLowerCase();
  if (text.includes("merge")) return "merge";
  if (text.includes("rcmerge")) return "rcmerge";
  if (text.includes("split")) return "split";
  if (text.includes("pdf to word")) return "pdfToWord";
  if (text.includes("word to pdf")) return "wordToPdf";
  if (text.includes("pdf to excel")) return "pdfToExcel";
  if (text.includes("excel to pdf")) return "excelToPdf";
  if (text.includes("jpg to pdf")) return "jpgToPdf";
  if (text.includes("pdf to jpg")) return "pdfToJpg";
  if (text.includes("edit")) return "pdfEditor";
  if (
    text.includes("organize") ||
    text.includes("delete") ||
    text.includes("rotate")
  )
    return "organizer";
  return "merge";
}

// ========= Sidebar Navigation ==========
const toolLinks = document.querySelectorAll(".tool-section a");

toolLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const toolId = link.dataset.tool;

    // save tool id (not text)
    localStorage.setItem("selectedTool", toolId);

    loadTool(toolId);

    // active class handling
    toolLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});
// highlight when clicking sidebar links (keeps existing behavior)
document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", (e) => {
    document
      .querySelectorAll(".sidebar a")
      .forEach((a) => a.classList.remove("active"));
    e.target.classList.add("active");
  });
});

// ========= Restore last selected tool on reload ==========
window.addEventListener("DOMContentLoaded", () => {
  const lastTool = localStorage.getItem("selectedTool");

  if (lastTool) {
    loadTool(lastTool);

    document.querySelectorAll(".tool-section a").forEach((a) => {
      a.classList.toggle("active", a.dataset.tool === lastTool);
    });
  } else {
    loadTool("merge");
  }
});
// ========= Tool Initializers ==========
function initTool(name) {
  switch (name) {
    case "merge":
      initMerge();
      break;

    case "split":
      initSplit();
      break;

    case "pdfToWord":
      initPdfToWord();
      break;

    case "wordToPdf":
      initWordToPdf();
      break;

    case "pdfToExcel":
      initPdfToExcel();
      break;

    case "excelToPdf":
      initExcelToPdf();
      break;

    case "jpgToPdf":
      initJpgToPdf();
      break;

    case "pdfToJpg":
      initPdfToJpg();
      break;

    case "pdfEditor":
      initPdfEditor();
      break;

    case "organizer":
      initOrganizer();
      break;

    // 🔥 NEW TOOLS
    case "compressPdf":
      initPdfCompressor();
      break;
    case "allMerge":
      initAllMerge();
      break;
    case "compressImg":
      initImageCompressor();
      break;

    default:
      console.warn(`No init function found for tool: ${name}`);
  }
}
// ========== Merge =========
function initMerge() {
  const dropZone = document.getElementById("mergeDropZone");
  const pdfInput = document.getElementById("mergePdfFiles");
  const fileListDiv = document.getElementById("mergeFileList");
  const generateBtn = document.getElementById("mergeGenerateBtn");
  const statusDiv = document.getElementById("mergeStatus");

  let mergeFiles = [];
  let sortAsc = true;

  // 📁 Manual file selection
  pdfInput.addEventListener("change", (e) =>
    handleMergeFiles(e.target.files, true),
  );

  // 📂 Drag & drop behavior
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragging"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
    handleMergeFiles(e.dataTransfer.files, false);
  });

  // ✅ Handle file logic
  function handleMergeFiles(files, replace = false) {
    const validFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf",
    );

    mergeFiles = replace ? validFiles : [...mergeFiles, ...validFiles];

    // Remove duplicates by file name
    mergeFiles = mergeFiles.filter(
      (file, index, self) =>
        index === self.findIndex((f) => f.name === file.name),
    );

    pdfInput.value = ""; // clear file input
    renderFileList();
  }

  // 🧾 Display selected files
  function renderFileList() {
    if (mergeFiles.length === 0) {
      fileListDiv.innerHTML = "<p>No PDF files selected.</p>";
      return;
    }

    fileListDiv.innerHTML = `
      <div class="file-list">
        <span class="indicator"> <i class="fa-solid fa-file-lines"> .</i>  ${mergeFiles.length} Files selected </span>
        <button id="mergeSortBtn" type="button">
          ${sortAsc ? "Sort ↓ (Z-A)" : "Sort ↑ (A-Z)"}
        </button>
        <ul>
          ${mergeFiles
            .map(
              (f, i) => `
            <li>
              <span class="file-name">${i + 1}. ${f.name}</span>
              <button class="remove-btn" data-index="${i}" aria-label="Remove file">
              <i class="fa-solid fa-xmark"></i>
              </button>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
    `;

    // Sorting logic
    const sortBtn = document.getElementById("mergeSortBtn");
    if (sortBtn) {
      sortBtn.addEventListener("click", () => {
        sortAsc = !sortAsc;
        mergeFiles.sort((a, b) =>
          sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
        );
        renderFileList();
      });
    }

    // Remove file buttons
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        if (!Number.isFinite(idx) || idx < 0 || idx >= mergeFiles.length)
          return;
        mergeFiles.splice(idx, 1);
        renderFileList();
      });
    });
  }

  // 🧩 Merge action
  generateBtn.addEventListener("click", async () => {
    if (mergeFiles.length === 0) {
      alert("Please select at least one PDF file!");
      return;
    }

    statusDiv.textContent = "Merging PDFs... Please wait.";

    try {
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (const file of mergeFiles) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      saveAs(blob, `merged_${Date.now()}.pdf`);
      statusDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> Merged PDF downloaded successfully!`;
    } catch (err) {
      console.error(err);
      statusDiv.textContent = "❌ Error merging PDFs.";
    }
  });
}
// ========== end =========

// ========== Split =========
async function splitPdfFile() {
  const input = document.getElementById("splitPdf");
  const status = document.getElementById("status");
  const file = input.files[0];

  if (!file) {
    status.textContent = "Please select a PDF file first.";
    return;
  }

  status.textContent = "Processing... Please wait ⏳";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = srcPdf.getPageCount();
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFLib.PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(srcPdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();

      const fileName = `${file.name.replace(".pdf", "")}_page${i + 1}.pdf`;
      zip.file(fileName, pdfBytes);

      // Optional: live progress
      status.textContent = `Splitting page ${i + 1} of ${totalPages}...`;
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(".pdf", "")}_split_pages.zip`;
    a.click();
    URL.revokeObjectURL(url);

    status.textContent = `✅ Split ${totalPages} pages and downloaded as ZIP.`;
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error splitting PDF.";
  }
}

function initSplit() {
  const fileInput = document.getElementById("splitPdf");
  const btn = document.getElementById("splitBtn");
  const status = document.getElementById("status");
  const dropZone = document.getElementById("splitPdf");

  // 🟢 Prevent default browser behavior
  ["dragenter", "dragover", "dragleave", "drop"].forEach((event) => {
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // 🎯 Highlight on drag
  ["dragenter", "dragover"].forEach((event) => {
    dropZone.addEventListener(event, () => {
      dropZone.classList.add("drag-active");
    });
  });

  // ❌ Remove highlight (IMPORTANT: check relatedTarget)
  ["dragleave", "drop"].forEach((event) => {
    dropZone.addEventListener(event, (e) => {
      // prevent flicker when moving inside dropzone
      if (event === "dragleave" && dropZone.contains(e.relatedTarget)) return;
      dropZone.classList.remove("drag-active");
    });
  });

  // 📂 Handle dropped file
  dropZone.addEventListener("drop", async (e) => {
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.name.toLowerCase().endsWith(".pdf"),
    );

    if (!file) {
      status.textContent = "❌ Only PDF files allowed.";
      return;
    }

    // 🔥 Assign file to input (so rest of code works same)
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      status.innerHTML = `📄 Selected: <b>${file.name}</b> (${totalPages} pages)`;
    } catch {
      status.textContent = "❌ Invalid PDF file.";
    }
  });

  // 📂 File input change
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) {
      status.textContent = "No file selected.";
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      status.innerHTML = `📄 Selected: <b>${file.name}</b> (${totalPages} pages)`;
    } catch {
      status.textContent = "❌ Invalid PDF file.";
    }
  });

  btn.addEventListener("click", splitPdfFile);
} // ========== end =========

// ========== pdf to word not working =========
async function convertPdfToWord() {
  const input = document.getElementById("pdfFiles");
  const status = document.getElementById("status");
  const files = input.files;

  if (!files.length) {
    status.textContent = "Please select at least one PDF file.";
    return;
  }

  status.textContent = "Processing... Please wait ⏳";

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.textContent = `Extracting text from ${file.name} (${i + 1}/${files.length})...`;

    const arrayBuffer = await file.arrayBuffer();

    // Load PDF using pdf.js
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      status.textContent = `Reading ${file.name}: Page ${pageNum}/${pdf.numPages}`;
    }

    // Create Word document using docx.js
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              children: [new docx.TextRun(fullText)],
            }),
          ],
        },
      ],
    });

    const docBuffer = await docx.Packer.toBlob(doc);
    const docName = file.name.replace(/\.pdf$/i, ".docx");
    zip.file(docName, docBuffer);
  }

  // If multiple files, create ZIP; if single, download directly
  if (files.length > 1) {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_pdfs_to_word.zip";
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = `✅ Converted ${files.length} PDFs and downloaded as ZIP.`;
  } else {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }

    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({ children: [new docx.TextRun(fullText)] }),
          ],
        },
      ],
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, ".docx");
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = `✅ Converted ${file.name} to Word.`;
  }
}

function initPdfToWord() {
  const input = document.getElementById("pdfFiles");
  const btn = document.getElementById("convertBtn");
  const status = document.getElementById("status");

  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      const names = Array.from(input.files)
        .map((f) => f.name)
        .join(", ");
      status.innerHTML = `📄 Selected: <b>${names}</b>`;
    } else {
      status.textContent = "No file selected.";
    }
  });

  btn.addEventListener("click", convertPdfToWord);
}
// ========== end =========

function initWordToPdf() {
  const btn = document.getElementById("convertBtn");
  btn.addEventListener("click", () =>
    alert("Word ➜ PDF function not implemented yet."),
  );
}
// ========== end =========

async function initPdfToExcel() {
  const fileInput = document.getElementById("pdfToExcelFiles");
  const convertBtn = document.getElementById("convertBtn");
  const statusDiv = document.getElementById("status");

  convertBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      statusDiv.textContent = "Please select a PDF file first.";
      return;
    }

    statusDiv.textContent = "Processing PDF...";

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Load PDF using pdfjs-dist (for text extraction)
      const pdfjsLib = window["pdfjsLib"];
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const excelData = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const textItems = content.items.map((item) => item.str);
        const text = textItems.join(" ");

        excelData.push({ Page: i, Content: text });
      }

      // Create a new workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "PDF_Content");

      // Export the Excel file
      const excelFileName = file.name.replace(/\.pdf$/i, ".xlsx");
      XLSX.writeFile(wb, excelFileName);

      statusDiv.textContent = "✅ Conversion successful! File downloaded.";
    } catch (err) {
      console.error(err);
      statusDiv.textContent = "❌ Error converting PDF to Excel.";
    }
  });
}

function initExcelToPdf() {
  const dropZone = document.querySelector(".dropZone");
  const fileInput = document.getElementById("excelFiles");
  const convertBtn = document.getElementById("convertBtn");
  const status = document.getElementById("status");
  let selectedFile = null;

  // === Drag and Drop Support ===
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragover"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
      status.innerHTML = `<p style="color:red;">Invalid file type. Please select an Excel file.</p>`;
      return;
    }
    selectedFile = file;
    status.innerHTML = `<p><b>Selected File:</b> ${file.name}</p>`;
  }

  // === Convert Excel to Image + PDF ===
  convertBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      status.innerHTML = `<p style="color:red;">Please select an Excel file first.</p>`;
      return;
    }
    status.innerHTML = `<p>Converting <b>${selectedFile.name}</b>...</p>`;

    const arrayBuffer = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    let isFirstSheet = true;

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!data.length) continue;

      // Find data boundaries
      const nonEmptyRows = data.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== ""),
      );
      if (!nonEmptyRows.length) continue;

      // Create hidden HTML table
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.fontFamily = "Arial";
      table.style.fontSize = "10pt";
      table.style.margin = "20px";
      table.style.border = "1px solid #ccc";

      for (const row of nonEmptyRows) {
        const tr = document.createElement("tr");
        for (const cell of row) {
          const td = document.createElement("td");
          td.textContent = cell ?? "";
          td.style.border = "1px solid #ccc";
          td.style.padding = "4px 8px";
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }

      // Add to DOM temporarily
      document.body.appendChild(table);

      // Convert table to image
      const canvas = await html2canvas(table, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (!isFirstSheet) pdf.addPage();
      pdf.text(`Sheet: ${sheetName}`, 40, 40);
      pdf.addImage(imgData, "PNG", 40, 60, pdfWidth - 80, pdfHeight - 60);

      // Remove table from DOM
      document.body.removeChild(table);

      isFirstSheet = false;
    }

    const pdfName = selectedFile.name.replace(/\.(xls|xlsx)$/i, ".pdf");
    pdf.save(pdfName);
    status.innerHTML = `<p style="color:green;">✅ Conversion complete! Downloading ${pdfName}</p>`;
  });
}

// ========== jpg to pdf =========
function initJpgToPdf() {
  const dropZone = document.getElementById("jpgDropZone");
  const fileInput = document.getElementById("jpgFiles");
  const fileListDiv = document.getElementById("jpgFileList");
  const convertBtn = document.getElementById("convertBtn");
  const status = document.getElementById("status");
  const mergeCheckbox = document.getElementById("mergeJpgs");

  let jpgFiles = [];
  let sortAsc = true;

  // 📁 Manual file selection
  fileInput.addEventListener("change", (e) =>
    handleFiles(e.target.files, true),
  );

  // 📂 Drag & Drop support
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragging"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
    handleFiles(e.dataTransfer.files, false);
  });

  // Handle file loading
  function handleFiles(files, replace = false) {
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(f.type),
    );

    jpgFiles = replace ? valid : [...jpgFiles, ...valid];

    // Remove duplicates by name
    jpgFiles = jpgFiles.filter(
      (file, i, self) => i === self.findIndex((f) => f.name === file.name),
    );

    fileInput.value = ""; // reset file input
    renderFileList();
  }

  // 🧾 Display file list
  function renderFileList() {
    if (jpgFiles.length === 0) {
      fileListDiv.innerHTML = "<p>No image files selected.</p>";
      return;
    }

    fileListDiv.innerHTML = `
    <div class="img-file-list">
      <span class="indicator">
        <i class="fa-solid fa-image"></i> ${jpgFiles.length} image(s) selected
      </span>
      <button id="jpgSortBtn" type="button" class="sort-btn">
        ${sortAsc ? "Sort ↓ (Z-A)" : "Sort ↑ (A-Z)"}
      </button>

      <ul class="img-list">
        ${jpgFiles
          .map(
            (f, i) => `
            <li class="img-item">
              <div class="img-preview">
                <img src="${URL.createObjectURL(f)}" alt="${f.name}" class="img-thumb" />
              </div>
              <div class="img-info">
                <span class="img-name">${i + 1}. ${f.name}</span>
              </div>
              <button class="remove-btn" data-index="${i}">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </li>`,
          )
          .join("")}
      </ul>
    </div>
  `;

    // Sort logic
    document.getElementById("jpgSortBtn").addEventListener("click", () => {
      sortAsc = !sortAsc;
      jpgFiles.sort((a, b) =>
        sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
      );
      renderFileList();
    });

    // Remove logic
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = +e.currentTarget.dataset.index;
        jpgFiles.splice(idx, 1);
        renderFileList();
      });
    });
  }

  // 🧩 Convert to PDF
  convertBtn.addEventListener("click", async () => {
    if (jpgFiles.length === 0) {
      status.innerHTML =
        "<span style='color:red'>Please select at least one image.</span>";
      return;
    }

    const mergeAll = mergeCheckbox.checked;
    status.textContent = "Processing images...";

    try {
      if (jpgFiles.length === 1 || mergeAll) {
        await mergeImagesToSinglePDF(jpgFiles);
        status.innerHTML =
          "<span style='color:green'>✅ PDF created successfully.</span>";
      } else {
        await createSeparatePDFsZip(jpgFiles);
        status.innerHTML =
          "<span style='color:green'>✅ Separate PDFs zipped successfully.</span>";
      }
    } catch (err) {
      console.error(err);
      status.innerHTML =
        "<span style='color:red'>❌ Error converting images.</span>";
    }
  });

  // 🧾 Merge all images into one PDF
  async function mergeImagesToSinglePDF(files) {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const imgBytes = await file.arrayBuffer();
      const img =
        file.type === "image/png"
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);

      const dims = img.scale(1);
      const page = pdfDoc.addPage([dims.width, dims.height]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    // ✅ Use the first image’s name for the PDF file name
    const firstFileName = files[0].name.replace(/\.[^/.]+$/, "");
    saveAs(
      new Blob([pdfBytes], { type: "application/pdf" }),
      `${firstFileName}.pdf`,
    );
  }
  // 📦 Separate PDFs into ZIP
  async function createSeparatePDFsZip(files) {
    const { PDFDocument } = PDFLib;
    const zip = new JSZip();

    for (const file of files) {
      const pdfDoc = await PDFDocument.create();
      const imgBytes = await file.arrayBuffer();
      const img =
        file.type === "image/png"
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);

      const dims = img.scale(1);
      const page = pdfDoc.addPage([dims.width, dims.height]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfName = `${file.name.replace(/\.[^/.]+$/, "")}.pdf`;
      zip.file(pdfName, pdfBytes);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `images_to_pdfs_${Date.now()}.zip`);
  }
}
// ========== end =========

// ========== pdf to jpg =========
async function initPdfToJpg() {
  const dropZone = document.getElementById("pdfDropZone");
  const input = document.getElementById("pdfToJpgInput");
  const fileListDiv = document.getElementById("pdfFileList");
  const convertBtn = document.getElementById("convertToJpgBtn");
  const statusDiv = document.getElementById("status");

  let selectedFile = null;
  let pageCount = 0;

  // 📂 Manual file selection
  input.addEventListener("change", (e) => handleFile(e.target.files[0]));

  // 📥 Drag & Drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragging"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });

  // 📄 Handle file selection
  async function handleFile(file) {
    if (!file || file.type !== "application/pdf") {
      alert("Please select a valid PDF file.");
      return;
    }
    selectedFile = file;
    input.value = "";
    fileListDiv.innerHTML = `<p><i class="fa-solid fa-file-pdf"></i> ${file.name}</p>`;
    statusDiv.textContent = "Reading PDF...";

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pageCount = pdf.numPages;
      renderFileInfo(file.name, pageCount);
      statusDiv.textContent = `✅ Loaded: ${pageCount} page(s)`;
    } catch (err) {
      console.error(err);
      statusDiv.textContent = "❌ Failed to read PDF.";
    }
  }

  // 📋 Show PDF name + total pages
  function renderFileInfo(fileName, count) {
    fileListDiv.innerHTML = `
      <div class="file-list">
        <span><i class="fa-solid fa-file-pdf"></i> ${fileName}</span>
        <p>Total Pages: <strong>${count}</strong></p>
      </div>
    `;
  }

  // ⚡ Convert PDF → JPG
  convertBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      alert("Please select a PDF first!");
      return;
    }

    statusDiv.textContent = "⏳ Converting... Please wait.";

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();
      const images = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
        images.push({ name: `page_${i}.jpg`, dataUrl });
        zip.file(`page_${i}.jpg`, dataUrl.split(",")[1], { base64: true });
      }

      // 📦 Download logic
      if (images.length === 1) {
        const a = document.createElement("a");
        a.href = images[0].dataUrl;
        a.download = selectedFile.name.replace(/\.pdf$/i, ".jpg");
        a.click();
        statusDiv.textContent = "✅ Single JPG downloaded!";
      } else {
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, selectedFile.name.replace(/\.pdf$/i, "_images.zip"));
        statusDiv.textContent = `✅ ${images.length} JPGs exported to ZIP.`;
      }
    } catch (err) {
      console.error(err);
      statusDiv.textContent = "❌ Error converting PDF to JPG.";
    }
  });
}
// ========== end =========

// ========== pdf editor (almost done)=========

async function initPdfEditor() {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("pdfEditorFile");
  const previewContainer = document.getElementById("previewContainer");
  const saveBtn = document.getElementById("saveEditedPdf");
  let selectedFiles = [];

  // ✅ Drag & Drop
  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragover"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

  function handleFiles(files) {
    selectedFiles = Array.from(files);
    previewContainer.innerHTML = "";
    selectedFiles.forEach((file) => renderPdf(file));
  }

  // ✅ Render & overlay text
  async function renderPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const fileDiv = document.createElement("div");
    fileDiv.className = "pdf-file-wrapper";
    fileDiv.innerHTML = `<h3>${file.name}</h3>`;
    previewContainer.appendChild(fileDiv);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = 1.4;
      const viewport = page.getViewport({ scale });

      // Create wrapper for each page
      const pageWrapper = document.createElement("div");
      pageWrapper.className = "page-wrapper";
      Object.assign(pageWrapper.style, {
        position: "relative",
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
        marginBottom: "1rem",
        background: "#fff",
        border: "1px solid #ccc",
      });
      fileDiv.appendChild(pageWrapper);

      // Canvas for rendering visuals (lines/shapes)
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      Object.assign(canvas.style, {
        position: "absolute",
        top: "0",
        left: "0",
        opacity: "0",
      });
      pageWrapper.appendChild(canvas);

      // Render PDF visuals
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Create editable text layer
      const textContent = await page.getTextContent();
      const textLayerDiv = document.createElement("div");
      textLayerDiv.className = "textLayer";
      Object.assign(textLayerDiv.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      });
      pageWrapper.appendChild(textLayerDiv);

      // Render editable text
      textContent.items.forEach((item) => {
        const transform = pdfjsLib.Util.transform(
          viewport.transform,
          item.transform,
        );
        const x = transform[4];
        const y = transform[5];
        const fontHeight = Math.hypot(transform[2], transform[3]);

        const span = document.createElement("span");
        span.className = "text-span";
        span.textContent = item.str;
        span.contentEditable = true;

        Object.assign(span.style, {
          position: "absolute",
          whiteSpace: "pre",
          left: `${x}px`,
          top: `${y - fontHeight}px`,
          fontSize: `${fontHeight}px`,
          fontFamily: "sans-serif",
          color: "black",
          background: "transparent",
          lineHeight: "1",
          transformOrigin: "left bottom",
          pointerEvents: "auto",
        });

        span.dataset.file = file.name;
        span.dataset.page = pageNum;

        textLayerDiv.appendChild(span);
      });
    }
  }
  // ✅ Save merged (later connect to pdf-lib logic)
  saveBtn.addEventListener("click", async () => {
    try {
      const { PDFDocument, rgb } = PDFLib;

      // Get all loaded file wrappers
      const fileWrappers = document.querySelectorAll(".pdf-file-wrapper");
      const mergedPdf = await PDFDocument.create();

      for (const fileWrapper of fileWrappers) {
        const fileName = fileWrapper.querySelector("h3").textContent.trim();
        const uploadedFile = [
          ...document.getElementById("pdfEditorFile").files,
        ].find((f) => f.name === fileName);

        if (!uploadedFile) continue;

        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        const pages = pdf.getPages();

        // For each page in this file
        const pageWrappers = fileWrapper.querySelectorAll(".page-wrapper");
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();

          // Clone into merged PDF
          const [embeddedPage] = await mergedPdf.copyPages(pdf, [i]);
          const mergedPage = mergedPdf.addPage(embeddedPage);

          // Get all edited text spans for this page
          const textSpans = pageWrappers[i].querySelectorAll(
            ".textLayer .text-span",
          );

          textSpans.forEach((span) => {
            // only draw if user actually edited the text
            if (span.textContent.trim() !== span.dataset.originalText?.trim()) {
              const x = parseFloat(span.style.left);
              const y = height - parseFloat(span.style.top);
              const fontSize = parseFloat(span.style.fontSize);
              const color = rgb(0, 0, 0);

              mergedPage.drawText(span.textContent, {
                x,
                y,
                size: fontSize,
                color,
              });
            }
          });
        }
      }

      // Save merged file
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "edited_merged.pdf";
      link.click();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to generate the edited PDF. Check console for details.");
    }
  });
}

function initOrganizer() {
  document
    .getElementById("addPage")
    .addEventListener("click", () =>
      alert("Add Page feature not implemented yet."),
    );
  document
    .getElementById("deletePage")
    .addEventListener("click", () =>
      alert("Delete Page feature not implemented yet."),
    );
  document
    .getElementById("rotatePage")
    .addEventListener("click", () =>
      alert("Rotate feature not implemented yet."),
    );
  document
    .getElementById("reorderPage")
    .addEventListener("click", () =>
      alert("Reorder feature not implemented yet."),
    );
}

const dropZones = document.querySelectorAll(".dropZone");

// ✨ Highlight when dragging
["dragenter", "dragover"].forEach((event) => {
  dropZones.forEach((zone) => {
    zone.addEventListener(event, () => {
      zone.classList.add("drag-active");
    });
  });
});

// ❌ Remove highlight
["dragleave", "drop"].forEach((event) => {
  dropZones.forEach((zone) => {
    zone.addEventListener(event, () => {
      zone.classList.remove("drag-active");
    });
  });
});

function initImageCompressor() {
  const input = document.getElementById("imgCompressInput");
  const list = document.getElementById("imgCompressList");
  const btn = document.getElementById("compressImgBtn");
  const status = document.getElementById("imgCompressStatus");
  const targetInput = document.getElementById("imgTargetSize");

  let files = [];
  const dropZone = document.getElementById("imgCompressDrop");

  // 🛑 Prevent browser default (important)
  ["dragenter", "dragover", "dragleave", "drop"].forEach((event) => {
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // ✨ Highlight when dragging
  ["dragenter", "dragover"].forEach((event) => {
    dropZone.addEventListener(event, () => {
      dropZone.classList.add("drag-active");
    });
  });

  // ❌ Remove highlight
  ["dragleave", "drop"].forEach((event) => {
    dropZone.addEventListener(event, () => {
      dropZone.classList.remove("drag-active");
    });
  });

  // 📂 Handle dropped images
  dropZone.addEventListener("drop", (e) => {
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (droppedFiles.length === 0) return;

    // 🔥 Merge with existing files
    files = [...files, ...droppedFiles].filter(
      (file, index, self) =>
        index ===
        self.findIndex((f) => f.name === file.name && f.size === file.size),
    );
    renderFileList();
  });
  // 📂 File select
  input.addEventListener("change", (e) => {
    files = Array.from(e.target.files);
    renderFileList();
  });

  // 📋 Render list (matches your CSS)
  function renderFileList() {
    list.innerHTML = "<ul></ul>";
    const ul = list.querySelector("ul");

    let totalSize = 0;

    files.forEach((file, index) => {
      const sizeKB = file.size / 1024;
      totalSize += sizeKB;

      const li = document.createElement("li");

      li.innerHTML = `
        <span>${file.name} (${sizeKB.toFixed(1)} KB)</span>
        <button class="remove-btn">x</button>
      `;

      li.querySelector(".remove-btn").onclick = () => {
        files.splice(index, 1);
        renderFileList();
      };

      ul.appendChild(li);
    });

    if (files.length > 0) {
      const summary = document.createElement("div");
      summary.className = "indicator";
      summary.textContent = `Total Files: ${files.length} | Total Size: ${(totalSize / 1024).toFixed(2)} MB`;
      list.appendChild(summary);
    }
  }

  // 🚀 Compress button
  btn.addEventListener("click", async () => {
    const targetKB = parseInt(targetInput.value);

    if (!targetKB || files.length === 0) {
      status.innerHTML =
        "<span style='color:red'>Enter target KB & select files</span>";
      return;
    }

    const zip = new JSZip();
    status.innerHTML = "Compressing images...";

    for (let file of files) {
      status.innerHTML = `⚙️ Processing: ${file.name}`;

      const result = await compressImage(file, targetKB);

      zip.file(file.name, result.blob);
      if (result.skipped) {
        status.innerHTML += `
    🟡 ${file.name} → ${result.sizeKB.toFixed(1)} KB 
    <br>Already below target, skipped
  `;
      } else {
        status.innerHTML += `
    ✅ ${file.name} → ${result.sizeKB.toFixed(1)} KB 
    <br>Compressed
  `;
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "compressed_images.zip");

    status.innerHTML +=
      "<br><span style='color:green'>🎉 All images compressed</span>";
  });

  // 🔥 Smart compression (closest match)
  async function compressImage(file, targetKB) {
    return new Promise((resolve) => {
      // 🔴 ADD THIS BLOCK
      const fileSizeKB = file.size / 1024;

      if (fileSizeKB <= targetKB) {
        return resolve({
          blob: file, // original file as blob
          sizeKB: fileSizeKB,
          skipped: true,
          message: `Image already below target (${fileSizeKB.toFixed(2)} KB)`,
        });
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);
      reader.readAsDataURL(file);

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let bestBlob = null;
        let bestDiff = Infinity;
        let bestSize = 0;

        // 🎯 Try multiple resolutions + qualities
        const scales = [1, 0.8, 0.6, 0.4];
        const qualities = [0.9, 0.7, 0.5, 0.3, 0.2];

        for (let scale of scales) {
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          for (let quality of qualities) {
            const blob = await new Promise((res) =>
              canvas.toBlob(res, "image/jpeg", quality),
            );

            const sizeKB = blob.size / 1024;
            const diff = Math.abs(sizeKB - targetKB);

            // save best match
            if (diff < bestDiff) {
              bestDiff = diff;
              bestBlob = blob;
              bestSize = sizeKB;
            }

            // 🎯 close enough → stop early
            if (sizeKB <= targetKB && diff < 10) {
              return resolve({ blob, sizeKB });
            }
          }
        }

        resolve({ blob: bestBlob, sizeKB: bestSize });
      };
    });
  }
}

function initPdfCompressor() {
  const input = document.getElementById("pdfCompressInput");
  const btn = document.getElementById("compressPdfBtn");
  const status = document.getElementById("pdfCompressStatus");
  const targetInput = document.getElementById("pdfTargetSize");
  const list = document.getElementById("pdfCompressList");
  const portraitToggle = document.getElementById("forcePortrait");
  let files = [];
  const dropZone = document.getElementById("pdfCompressDrop");

  // 🟢 Prevent default behavior
  ["dragenter", "dragover", "dragleave", "drop"].forEach((event) => {
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // 🎯 Highlight on drag
  ["dragenter", "dragover"].forEach((event) => {
    dropZone.addEventListener(event, () => {
      dropZone.classList.add("drag-active");
    });
  });

  // ❌ Remove highlight
  ["dragleave", "drop"].forEach((event) => {
    dropZone.addEventListener(event, () => {
      dropZone.classList.remove("drag-active");
    });
  });

  // 📂 Handle dropped files
  dropZone.addEventListener("drop", (e) => {
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.name.toLowerCase().endsWith(".pdf"),
    );

    if (droppedFiles.length === 0) return;

    // 🔥 Merge with existing files
    files = [...files, ...droppedFiles].filter(
      (file, index, self) =>
        index ===
        self.findIndex((f) => f.name === file.name && f.size === file.size),
    );
    renderFileList();
  });
  // 📂 Handle file selection
  input.addEventListener("change", (e) => {
    files = Array.from(e.target.files);
    renderFileList();
  });

  // 📋 Render file list UI
  function renderFileList() {
    const list = document.getElementById("pdfCompressList");

    // clear and create UL
    list.innerHTML = "<ul></ul>";
    const ul = list.querySelector("ul");

    let totalSize = 0;

    files.forEach((file, index) => {
      const sizeKB = file.size / 1024;
      totalSize += sizeKB;

      const li = document.createElement("li");

      li.innerHTML = `
      <span>${file.name} (${sizeKB.toFixed(1)} KB)</span>
      <button class="remove-btn">x</button>
    `;

      // ❌ remove file
      li.querySelector(".remove-btn").onclick = () => {
        files.splice(index, 1);
        renderFileList();
      };

      ul.appendChild(li);
    });

    // 🔥 Optional: show total summary
    if (files.length > 0) {
      const summary = document.createElement("div");
      summary.className = "indicator";
      summary.textContent = `Total Files: ${files.length} | Total Size: ${(totalSize / 1024).toFixed(2)} MB`;

      list.appendChild(summary);
    }
  }
  // 🚀 Compress button
  btn.addEventListener("click", async () => {
    const targetKB = parseInt(targetInput.value);

    if (!targetKB || files.length === 0) {
      status.innerHTML =
        "<span style='color:red'>Enter target KB & select PDFs</span>";
      return;
    }

    status.textContent = "Compressing PDFs...";
    const zip = new JSZip();

    for (let file of files) {
      const result = await compressPDF(file, targetKB, portraitToggle.checked);
      // 📦 Always add to zip (compressed OR original)
      zip.file(file.name, result.bytes);

      // 🎯 Handle skipped vs compressed
      if (result.skipped) {
        status.innerHTML = `
      🟡 ${file.name} → ${result.sizeKB.toFixed(1)} KB 
      <br>Already below target (${targetKB} KB), skipped compression
    `;
      } else {
        status.innerHTML = `
      ✅ ${file.name} → ${result.sizeKB.toFixed(1)} KB 
      <br>(Closest to ${targetKB} KB)
    `;
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "compressed_pdfs.zip");

    status.innerHTML =
      "<span style='color:green'>✅ PDFs compressed successfully</span>";
  });

  // 🔥 REAL PDF compression (fixed)
  async function compressPDF(file, targetKB, forcePortrait) {
    // 🔴 Skip if already smaller
    const fileSizeKB = file.size / 1024;

    if (fileSizeKB <= targetKB) {
      return {
        bytes: await file.arrayBuffer(),
        sizeKB: fileSizeKB,
        skipped: true,
        message: `File already below target size (${fileSizeKB.toFixed(2)} KB)`,
      };
    }

    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    const { PDFDocument } = PDFLib;

    let bestOutput = null;
    let bestDiff = Infinity;
    let bestSize = 0;

    // 🎯 Try different scales + qualities
    const scales = [1.5, 1.2, 1.0, 0.8];
    const qualities = [0.9, 0.7, 0.5, 0.3, 0.2];

    for (let scale of scales) {
      for (let quality of qualities) {
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality),
          );

          const imgBytes = await blob.arrayBuffer();
          const img = await newPdf.embedJpg(imgBytes);

          // 📐 Original dimensions
          let pageWidth = viewport.width;
          let pageHeight = viewport.height;

          // 🔄 Force portrait if enabled
          let rotate = false;
          if (forcePortrait && pageWidth > pageHeight) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
            rotate = true;
          }

          const newPage = newPdf.addPage([pageWidth, pageHeight]);

          // 📏 Maintain aspect ratio (no stretching)
          const scaleFactor = Math.min(
            pageWidth / viewport.width,
            pageHeight / viewport.height,
          );

          const drawWidth = viewport.width * scaleFactor;
          const drawHeight = viewport.height * scaleFactor;

          // 📍 Center image
          const x = (pageWidth - drawWidth) / 2;
          const y = (pageHeight - drawHeight) / 2;

          // 🔄 Draw with rotation if needed
          newPage.drawImage(img, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
            rotate: rotate ? PDFLib.degrees(90) : undefined,
          });
        }

        const outputBytes = await newPdf.save();
        const sizeKB = outputBytes.byteLength / 1024;

        const diff = Math.abs(sizeKB - targetKB);

        // ✅ Save best match
        if (diff < bestDiff) {
          bestDiff = diff;
          bestOutput = outputBytes;
          bestSize = sizeKB;
        }

        // 🎯 Stop early if very close
        if (sizeKB <= targetKB && diff < 20) {
          return { bytes: outputBytes, sizeKB };
        }
      }
    }

    // 🔚 fallback best result
    return { bytes: bestOutput, sizeKB: bestSize };
  }
}

async function initAllMerge() {
  const fileInput = document.getElementById("allMergeFiles");
  const dropZone = document.getElementById("allMergeDrop");
  const fileList = document.getElementById("allMergeList");
  const status = document.getElementById("allMergeStatus");
  const mergeBtn = document.getElementById("allMergeBtn");
  const outputName = document.getElementById("allMergeName");

  if (!outputName.value.trim()) outputName.value = "merged.pdf";

  let files = [];

  //---------------------------------
  // Add Files
  //---------------------------------

  function addFiles(selected) {
    [...selected].forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        files.push(file);
      }
    });

    renderList();
  }

  //---------------------------------
  // Render List
  //---------------------------------

  function renderList() {
    fileList.innerHTML = "";

    files.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.dataset.index = index;

      const icon = file.type === "application/pdf" ? "📄" : "🖼️";

      item.innerHTML = `
            <div class="file-left">
                <span class="file-icon">${icon}</span>
                <span class="file-name">${file.name}</span>
            </div>

            <button class="remove-btn">✖</button>
        `;

      item.querySelector(".remove-btn").onclick = () => {
        files.splice(index, 1);
        renderList();
      };

      fileList.appendChild(item);
    });

    if (fileList.sortable) fileList.sortable.destroy();

    fileList.sortable = new Sortable(fileList, {
      animation: 150,
      ghostClass: "dragging",

      onEnd: (e) => {
        const moved = files.splice(e.oldIndex, 1)[0];
        files.splice(e.newIndex, 0, moved);
      },
    });
  }

  //---------------------------------
  // Drag & Drop
  //---------------------------------

  fileInput.onchange = (e) => addFiles(e.target.files);

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add("drag");
  };

  dropZone.ondragleave = () => dropZone.classList.remove("drag");

  dropZone.ondrop = (e) => {
    e.preventDefault();

    dropZone.classList.remove("drag");

    addFiles(e.dataTransfer.files);
  };

  //---------------------------------
  // Sort Buttons
  //---------------------------------

  const controls = document.createElement("div");

  controls.innerHTML = `
        <button id="sortAZ">Sort A-Z</button>
        <button id="sortZA">Sort Z-A</button>
    `;

  fileList.before(controls);

  document.getElementById("sortAZ").onclick = () => {
    files.sort((a, b) => a.name.localeCompare(b.name));

    renderList();
  };

  document.getElementById("sortZA").onclick = () => {
    files.sort((a, b) => b.name.localeCompare(a.name));

    renderList();
  };

  //---------------------------------
  // Merge
  //---------------------------------

  mergeBtn.onclick = async () => {
    if (files.length === 0) {
      alert("Select files.");

      return;
    }

    status.innerHTML = "Generating PDF...";

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (const file of files) {
      //---------------------------------
      // PDF
      //---------------------------------

      if (file.type === "application/pdf") {
        const bytes = await file.arrayBuffer();

        const src = await PDFLib.PDFDocument.load(bytes);

        const copied = await pdfDoc.copyPages(src, src.getPageIndices());

        copied.forEach((page) => pdfDoc.addPage(page));
      }

      //---------------------------------
      // IMAGE
      //---------------------------------
      else {
        const bytes = await file.arrayBuffer();

        let img;

        if (file.type === "image/png") {
          img = await pdfDoc.embedPng(bytes);
        } else {
          img = await pdfDoc.embedJpg(bytes);
        }

        const page = pdfDoc.addPage([img.width, img.height]);

        page.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    let name = outputName.value.trim();

    if (!name.toLowerCase().endsWith(".pdf")) name += ".pdf";

    saveAs(
      new Blob([pdfBytes], {
        type: "application/pdf",
      }),
      name,
    );

    status.innerHTML = `✅ Created ${name}`;
  };
}
