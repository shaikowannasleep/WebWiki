// Global Image Upload & Paste Handling

document.addEventListener('DOMContentLoaded', () => {
  const globalImageUploadModal = document.getElementById('globalImageUploadModal');
  const globalImageFileInput = document.getElementById('globalImageFileInput');
  const globalImagePasteZone = document.getElementById('globalImagePasteZone');
  const globalImagePreviewContainer = document.getElementById('globalImagePreviewContainer');
  const globalImagePreview = document.getElementById('globalImagePreview');
  const btnGlobalImageApply = document.getElementById('btnGlobalImageApply');
  
  let currentGlobalImageTargetInput = null;
  let currentGlobalImageBlob = null;
  let currentGlobalImageExt = 'png';

  window.openGlobalImageModal = function(inputId) {
    currentGlobalImageTargetInput = document.getElementById(inputId);
    currentGlobalImageBlob = null;
    if (globalImagePreview) globalImagePreview.src = '';
    if (globalImagePreviewContainer) globalImagePreviewContainer.style.display = 'none';
    if (globalImageUploadModal) globalImageUploadModal.classList.add('active');
    if (globalImagePasteZone) globalImagePasteZone.focus(); // Focus to catch paste event easily
  };

  window.closeGlobalImageModal = function() {
    if (globalImageUploadModal) globalImageUploadModal.classList.remove('active');
    currentGlobalImageBlob = null;
  };

  if (globalImagePasteZone) {
    globalImagePasteZone.addEventListener('paste', handleGlobalImagePaste);
  }

  if (globalImageFileInput) {
    globalImageFileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) processGlobalImageFile(e.target.files[0]);
    });
  }

  function handleGlobalImagePaste(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        processGlobalImageFile(blob);
        e.preventDefault();
        return;
      }
    }
  }

  function processGlobalImageFile(blob) {
    currentGlobalImageBlob = blob;
    if (blob.type === 'image/jpeg') currentGlobalImageExt = 'jpg';
    else if (blob.type === 'image/webp') currentGlobalImageExt = 'webp';
    else currentGlobalImageExt = 'png';

    const reader = new FileReader();
    reader.onload = ev => {
      if (globalImagePreview) globalImagePreview.src = ev.target.result;
      if (globalImagePreviewContainer) globalImagePreviewContainer.style.display = 'block';
    };
    reader.readAsDataURL(blob);
  }

  if (btnGlobalImageApply) {
    btnGlobalImageApply.addEventListener('click', async () => {
      if (!currentGlobalImageBlob) return;
      if (!DataLayer.projectDirHandle) {
        alert("Vui lòng Bấm nút [📂 Kết Nối Local Disk] ở thanh ngang phía trên cùng trước khi lưu ảnh!");
        return;
      }
      
      const filename = `img_${Date.now()}.${currentGlobalImageExt}`;
      const originalText = btnGlobalImageApply.textContent;
      btnGlobalImageApply.textContent = '⏳ Đang lưu...';
      try {
        const savedPath = await DataLayer.saveImageDirectToLocalDisk(currentGlobalImageBlob, filename);
        if (currentGlobalImageTargetInput) {
          currentGlobalImageTargetInput.value = savedPath;
          // Trigger events to update the underlying models
          currentGlobalImageTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
          currentGlobalImageTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        closeGlobalImageModal();
      } catch (err) {
        console.error(err);
        alert("Lỗi lưu ảnh: " + err.message);
      }
      btnGlobalImageApply.textContent = originalText;
    });
  }

  // CATCH PASTE DIRECTLY ON ANY INPUT FIELD
  document.addEventListener('paste', async e => {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'text') {
      // Chỉ tự động lưu nếu ID input có chứa chữ icon, avatar, image, banner
      const isImageUrlField = /icon|avatar|image|banner/i.test(activeEl.id);
      if (isImageUrlField) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let imageBlob = null;
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            imageBlob = item.getAsFile();
            break;
          }
        }
        
        if (imageBlob) {
          e.preventDefault(); // Ngăn paste base64 raw text
          if (!DataLayer.projectDirHandle) {
             alert("Vui lòng Bấm nút [📂 Kết Nối Local Disk] ở thanh ngang phía trên cùng trước khi paste ảnh!");
             return;
          }
          let ext = 'png';
          if (imageBlob.type === 'image/jpeg') ext = 'jpg';
          else if (imageBlob.type === 'image/webp') ext = 'webp';
          const filename = `img_${Date.now()}.${ext}`;
          
          activeEl.value = '⏳ Đang lưu...';
          try {
            const savedPath = await DataLayer.saveImageDirectToLocalDisk(imageBlob, filename);
            activeEl.value = savedPath;
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            activeEl.dispatchEvent(new Event('change', { bubbles: true }));
          } catch(err) {
            activeEl.value = '';
            alert("Lỗi lưu ảnh: " + err.message);
          }
        }
      }
    }
  });

});
