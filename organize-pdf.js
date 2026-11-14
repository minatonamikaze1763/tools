(() => {
  "use strict";
  const move = (items, from, to) => {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
    const result = [...items]; result.splice(to,0,result.splice(from,1)[0]); return result;
  };
  async function exportPdf(bytes, indices, PDFDocument) {
    if (!indices.length) throw Error("Keep at least one page before downloading.");
    const source = await PDFDocument.load(bytes);
    const count = source.getPageCount();
    if (indices.some(i => !Number.isInteger(i) || i < 0 || i >= count) || new Set(indices).size !== indices.length)
      throw Error("Invalid page selection. Reload the PDF and try again.");
    const output = await PDFDocument.create();
    for (const page of await output.copyPages(source,indices)) output.addPage(page);
    return output.save();
  }
  function init() {
    const root = document.getElementById("ndcOrganizer");
    const input = root.querySelector("#orgFile"),drop = root.querySelector("#orgDrop"),grid = root.querySelector("#orgPages");
    const status = root.querySelector("#orgStatus"),download = root.querySelector("#orgDownload"),restore = root.querySelector("#orgRestore"),count = root.querySelector("#orgCount");
    let bytes=null, sourceName="document.pdf", pages=[], originals=[], cards=new Map(), task=null, pdf=null, render=null, sortable=null, alive=true, busy=false, generation=0, dragged=null;
    const say = (message,error=false) => {status.textContent=message;status.dataset.error=String(error);};
    function controls() {
      input.disabled=busy; drop.setAttribute("aria-busy",String(busy));
      download.disabled=busy || !bytes || !pages.length;
      restore.disabled=busy || !bytes;
      if(sortable) sortable.option("disabled",busy);
      [...grid.querySelectorAll("button")].forEach(button=>button.disabled=busy);
      count.textContent=bytes ? `${pages.length} of ${originals.length} pages kept` : "No PDF selected";
    }
    function drawOrder() {
      for(const [index,card] of cards) {card.hidden=!pages.includes(index);}
      pages.forEach((index,position)=>{
        const card=cards.get(index);grid.append(card);
        card.querySelector(".org-position").textContent=`Position ${position+1}`;
        card.querySelector("[data-action='left']").disabled=busy || position===0;
        card.querySelector("[data-action='right']").disabled=busy || position===pages.length-1;
      });
      controls();
      pages.forEach((index,position)=>{
        const card=cards.get(index);
        card.querySelector("[data-action='left']").disabled=busy || position===0;
        card.querySelector("[data-action='right']").disabled=busy || position===pages.length-1;
      });
    }
    async function clearDocument() {
      try { render?.cancel(); } catch {}
      render=null;
      const previous=task;task=null;pdf=null;
      if(previous) await previous.destroy().catch(()=>{});
      grid.replaceChildren();cards.clear();bytes=null;pages=[];originals=[];
    }
    function createCard(index) {
      const card=document.createElement("article");card.className="org-page";card.dataset.page=String(index);
      card.innerHTML=`<div class="org-page-top"><span class="org-drag" title="Drag to reorder" aria-label="Drag page">⠿</span><strong>Original page ${index+1}</strong><button type="button" data-action="delete" aria-label="Delete original page ${index+1}" title="Delete page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg></button></div><div class="org-canvas"><canvas aria-label="Preview of original page ${index+1}"></canvas></div><div class="org-page-bottom"><button type="button" data-action="left" aria-label="Move original page ${index+1} earlier">←</button><span class="org-position">Position ${index+1}</span><button type="button" data-action="right" aria-label="Move original page ${index+1} later">→</button></div>`;
      cards.set(index,card);grid.append(card);
      if(!window.Sortable){card.draggable=true;card.addEventListener("dragstart",event=>{if(busy){event.preventDefault();return}dragged=index;event.dataTransfer.setData("text/plain",String(index));});card.addEventListener("dragover",event=>event.preventDefault());card.addEventListener("drop",event=>{event.preventDefault();event.stopPropagation();if(!busy&&dragged!==null){pages=move(pages,pages.indexOf(dragged),pages.indexOf(index));drawOrder();say("Page order updated.")}dragged=null;});}
      return card;
    }
    async function load(file) {
      if(busy || !alive || !file)return;
      if(!/\.pdf$/i.test(file.name) && file.type!=="application/pdf"){say("Choose one PDF file.",true);return;}
      if(!window.pdfjsLib || !window.PDFLib){say("PDF libraries did not load. Refresh the page and try again.",true);return;}
      const current=++generation;busy=true;controls();say("Reading PDF and preparing page previews…");
      try {
        await clearDocument();if(!alive || current!==generation)return;
        bytes=new Uint8Array(await file.arrayBuffer());sourceName=file.name;
        // PDF.js may transfer its buffer to a worker; keep the export bytes separate.
        task=pdfjsLib.getDocument({data:bytes.slice()});pdf=await task.promise;
        if(!pdf.numPages)throw Error("This PDF has no pages.");
        originals=Array.from({length:pdf.numPages},(_,i)=>i);pages=[...originals];
        for(const index of pages)createCard(index);
        controls();
        for(const index of originals){
          if(!alive || current!==generation)return;
          say(`Rendering preview ${index+1} of ${originals.length}…`);
          const page=await pdf.getPage(index+1),base=page.getViewport({scale:1});
          const viewport=page.getViewport({scale:Math.min(360/base.width,480/base.height)});
          const canvas=cards.get(index).querySelector("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
          render=page.render({canvasContext:canvas.getContext("2d"),viewport});await render.promise;render=null;page.cleanup();
        }
        say(`${sourceName}: drag pages to reorder, or use the arrow and delete buttons.`);
      } catch(error) {
        if(alive && current===generation){await clearDocument();say(error.name==="PasswordException" ? "Password-protected PDFs are not supported. Upload an unlocked PDF." : "Could not open this PDF: "+error.message,true);}
      } finally {if(alive&&current===generation){busy=false;drawOrder();}}
    }
    input.addEventListener("change",()=>{const file=input.files?.[0];input.value="";void load(file);});
    for(const type of ["dragenter","dragover"])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.add("drag-active");});
    for(const type of ["dragleave","drop"])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove("drag-active");});
    drop.addEventListener("drop",event=>{const files=[...(event.dataTransfer?.files||[])];if(files.length!==1){say("Drop one PDF at a time.",true);return}void load(files[0]);});
    grid.addEventListener("click",event=>{
      const button=event.target.closest("button[data-action]");if(!button||busy)return;
      const index=Number(button.closest("[data-page]").dataset.page),position=pages.indexOf(index);
      if(button.dataset.action==="delete"){pages=pages.filter(i=>i!==index);say(pages.length ? `Original page ${index+1} removed. Restore all pages to undo.` : "All pages removed. Restore pages before downloading.");}
      else {pages=move(pages,position,position+(button.dataset.action==="left"?-1:1));say("Page order updated.");}
      drawOrder();
    });
    restore.addEventListener("click",()=>{if(busy)return;pages=[...originals];drawOrder();say("All pages restored in their original order.");});
    download.addEventListener("click",async()=>{
      if(busy||!bytes||!pages.length)return;busy=true;controls();say("Building organized PDF…");
      try {
        const result=await exportPdf(bytes,[...pages],PDFLib.PDFDocument);if(!alive)return;
        const url=URL.createObjectURL(new Blob([result],{type:"application/pdf"}));
        const link=document.createElement("a");link.href=url;link.download=sourceName.replace(/\.pdf$/i,"")+"-organized.pdf";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
        say(`Downloaded organized PDF with ${pages.length} page(s).`);
      } catch(error){if(alive)say("Could not export PDF: "+error.message,true);}
      finally {if(alive){busy=false;drawOrder();}}
    });
    if(window.Sortable)sortable=new Sortable(grid,{animation:160,handle:".org-drag",draggable:".org-page:not([hidden])",filter:"button",ghostClass:"org-ghost",onEnd:()=>{if(busy)return;pages=[...grid.querySelectorAll(".org-page:not([hidden])")].map(card=>Number(card.dataset.page));drawOrder();say("Page order updated.");}});
    controls();
    return ()=>{alive=false;generation++;sortable?.destroy();void clearDocument();};
  }
  window.NDCOrganizer=Object.freeze({init,move,exportPdf});
})();
