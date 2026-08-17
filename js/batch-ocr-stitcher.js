/**
 * Universal Multi-Screenshot Stitcher & Smart Douluo OCR Pipeline V6.6
 * - Accepts arbitrary N screenshots (1 to 50+ images) via Drag & Drop or Ctrl+V Clipboard.
 * - Stitches arbitrary N vertical screenshots into 1 high-resolution continuous scroll image.
 * - In-Browser OCR (Tesseract.js CDN) to extract text across all images.
 * - Smart Douluo Regex Parser to automatically identify Name, Type, Cost, CD, Description, and Soul Ring Milestones.
 */

window.BatchOCRStitcher = (function() {
  'use strict';

  /** @type {Array<{ id: string, file: File, dataUrl: string, img: HTMLImageElement }>} */
  let uploadedImages = [];
  let stitchedDataUrl = null;
  let ocrWorker = null;

  /**
   * Add new images from FileList or Array
   * @param {FileList|File[]} files
   * @returns {Promise<number>} Total images after addition
   */
  async function addFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    for (const file of validFiles) {
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);
      uploadedImages.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        file,
        dataUrl,
        img
      });
    }

    return uploadedImages.length;
  }

  /**
   * Add image from Clipboard blob/file
   * @param {File} blob
   */
  async function addClipboardBlob(blob) {
    const dataUrl = await readFileAsDataURL(blob);
    const img = await loadImage(dataUrl);
    uploadedImages.push({
      id: `img_clip_${Date.now()}`,
      file: blob,
      dataUrl,
      img
    });
    return uploadedImages.length;
  }

  function getImages() {
    return uploadedImages;
  }

  function removeImage(id) {
    uploadedImages = uploadedImages.filter(item => item.id !== id);
  }

  function reorderImage(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= uploadedImages.length) return;
    const [moved] = uploadedImages.splice(fromIndex, 1);
    uploadedImages.splice(toIndex, 0, moved);
  }

  function clearImages() {
    uploadedImages = [];
    stitchedDataUrl = null;
  }

  /**
   * Helper: Read file as Data URL
   */
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Helper: Preload HTMLImageElement
   */
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /* =========================================================================
     1. SEAMLESS VERTICAL CANVAS STITCHER
     Ghép N ảnh thành 1 ảnh dọc liên tục độ phân giải cao
     ========================================================================= */

  /**
   * Stitches all uploaded images vertically
   * @returns {string} DataURL of the stitched image
   */
  function stitchVertical() {
    if (uploadedImages.length === 0) return null;

    if (uploadedImages.length === 1) {
      stitchedDataUrl = uploadedImages[0].dataUrl;
      return stitchedDataUrl;
    }

    // Determine target canvas width (maximum width among all images)
    const maxWidth = Math.max(...uploadedImages.map(item => item.img.naturalWidth || item.img.width));
    
    // Calculate scaled heights and total canvas height
    let totalHeight = 0;
    const renderItems = uploadedImages.map(item => {
      const origW = item.img.naturalWidth || item.img.width;
      const origH = item.img.naturalHeight || item.img.height;
      const scale = maxWidth / origW;
      const scaledH = origH * scale;
      const y = totalHeight;
      totalHeight += scaledH;
      return { img: item.img, y, height: scaledH };
    });

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // Fill dark background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, maxWidth, totalHeight);

    // Draw each image onto canvas
    renderItems.forEach(item => {
      ctx.drawImage(item.img, 0, item.y, maxWidth, item.height);
    });

    stitchedDataUrl = canvas.toDataURL('image/png');
    return stitchedDataUrl;
  }

  /**
   * Copy stitched image to clipboard as PNG blob
   */
  async function copyStitchedToClipboard() {
    if (!stitchedDataUrl) stitchVertical();
    if (!stitchedDataUrl) throw new Error('Chưa có ảnh để sao chép.');

    const res = await fetch(stitchedDataUrl);
    const blob = await res.blob();

    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } else {
      throw new Error('Trình duyệt không hỗ trợ ClipboardItem.');
    }
  }

  /* =========================================================================
     2. IN-BROWSER OCR & SMART DOULUO REGEX PARSER
     ========================================================================= */

  /**
   * Run OCR on all images sequentially or on the stitched image using Tesseract.js
   * @param {Function} onProgress - Progress callback (percent, statusText)
   * @param {string} lang - Language code (e.g. vie, chi_sim, chi_tra, eng)
   * @returns {Promise<string>} Combined extracted text
   */
  async function runOCR(onProgress, lang = 'vie') {
    if (uploadedImages.length === 0) throw new Error('Vui lòng chọn ít nhất 1 ảnh chụp màn hình.');

    // Ensure Tesseract.js is loaded
    if (typeof Tesseract === 'undefined') {
      if (onProgress) onProgress(10, 'Đang nạp thư viện OCR...');
      await loadTesseractCDN();
    }

    if (onProgress) onProgress(20, 'Đang chuẩn bị ảnh nối...');
    const combinedDataUrl = stitchVertical();

    if (onProgress) onProgress(40, `Đang khởi tạo bộ nhận diện (${lang})...`);

    try {
      const worker = await Tesseract.createWorker(lang, 1, {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(40 + Math.round(m.progress * 60), 'Đang quét văn bản...');
          }
        }
      });
      
      const ret = await worker.recognize(combinedDataUrl);
      await worker.terminate();

      if (onProgress) onProgress(100, 'Hoàn tất quét OCR!');
      return ret.data.text;
    } catch (err) {
      console.error('Lỗi Tesseract OCR:', err);
      throw new Error(err.message || 'Lỗi không xác định khi quét OCR');
    }
  }

  function loadTesseractCDN() {
    return new Promise((resolve, reject) => {
      if (typeof Tesseract !== 'undefined') return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Không thể tải Tesseract.js từ CDN.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Smart Douluo Regex Parser:
   * Parses raw scanned text into structured skill data matching hero schema
   * @param {string} rawText
   * @returns {Object} Structured skill object
   */
  function parseDouluoSkillText(rawText) {
    if (!rawText) return null;

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return null;

    const result = {
      name: '',
      type: 'Chủ động',
      cost: '0 Hồn Lực',
      cooldown: '0 lượt',
      description: '',
      ringUpgrades: []
    };

    // 1. Guess Skill Name (Usually the first strong title line)
    result.name = lines[0].replace(/[\[\]【】]/g, '').trim();

    // 2. Extract Type, Cost, Cooldown
    rawText.replace(/(\d+)\s*(Hồn Lực|hon luc|energy)/i, (m, val) => {
      result.cost = `${val} Hồn Lực`;
    });

    rawText.replace(/(CD|Hồi chiêu|hoi chieu|hồi)\s*[:：]?\s*(\d+)\s*(lượt|giây|s)/i, (m, p1, val, unit) => {
      result.cooldown = `${val} ${unit}`;
    });

    if (/bị động|passive|bi dong/i.test(rawText)) {
      result.type = 'Bị động';
    } else if (/tiên cơ|tien co/i.test(rawText)) {
      result.type = 'Tiên cơ';
    } else if (/bí thuật|bi thuat/i.test(rawText)) {
      result.type = 'Bí thuật';
    }

    // 3. Extract Soul Ring Milestones (100 năm, 1.000 năm, 1 vạn, 2.5 vạn, 5 vạn, 10 vạn, 100 vạn)
    const ringMatches = [];
    const ringRegex = /(100\s*năm|1[,.]?000\s*năm|1\s*vạn|2[.,]5\s*vạn|25[,.]?000\s*năm|5\s*vạn|50[,.]?000\s*năm|10\s*vạn|100[,.]?000\s*năm|100\s*vạn)[\s:：.-]+([\s\S]*?)(?=(100\s*năm|1[,.]?000\s*năm|1\s*vạn|2[.,]5\s*vạn|25[,.]?000\s*năm|5\s*vạn|50[,.]?000\s*năm|10\s*vạn|100[,.]?000\s*năm|100\s*vạn|$))/gi;

    let match;
    while ((match = ringRegex.exec(rawText)) !== null) {
      const rawYear = match[1].trim();
      const rawBonus = match[2].trim().replace(/\n+/g, ' ');

      // Standardize year label
      let standardYear = rawYear;
      let starCount = 4;
      let starColor = 'gold';

      if (/100\s*vạn|100[,.]?000\s*năm/i.test(rawYear)) {
        standardYear = '100,000 năm (100 vạn)';
        starCount = 6;
        starColor = 'red';
      } else if (/50[,.]?000\s*năm|5\s*vạn/i.test(rawYear)) {
        standardYear = '50,000 năm (5 vạn)';
        starCount = 5;
        starColor = 'red';
      } else if (/25[,.]?000\s*năm|2[.,]5\s*vạn/i.test(rawYear)) {
        standardYear = '25,000 năm (2.5 vạn)';
        starCount = 4;
        starColor = 'red';
      } else if (/10[,.]?000\s*năm|1\s*vạn/i.test(rawYear)) {
        standardYear = '10,000 năm (1 vạn)';
        starCount = 5;
        starColor = 'gold';
      } else if (/1[,.]?000\s*năm/i.test(rawYear)) {
        standardYear = '1,000 năm (1k)';
        starCount = 4;
        starColor = 'gold';
      }

      if (rawBonus.length > 5) {
        ringMatches.push({
          year: standardYear,
          bonus: rawBonus,
          requirements: [
            { type: 'star', color: starColor, count: starCount }
          ]
        });
      }
    }

    result.ringUpgrades = ringMatches;

    // 4. Extract Main Description (Text before the first ring milestone)
    let descPart = rawText;
    const firstRingIndex = rawText.search(/(100\s*năm|1[,.]?000\s*năm|1\s*vạn|2[.,]5\s*vạn|5\s*vạn|10\s*vạn)/i);
    if (firstRingIndex !== -1) {
      descPart = rawText.substring(0, firstRingIndex);
    }

    // Clean up title lines from descPart
    const descLines = descPart.split('\n').filter(l => {
      const s = l.trim();
      return s.length > 15 || (!s.includes(result.name) && !s.includes(result.cost));
    });

    result.description = descLines.join(' ').replace(/\s+/g, ' ').trim() || descPart.trim();

    return result;
  }

  return {
    addFiles,
    addClipboardBlob,
    getImages,
    removeImage,
    reorderImage,
    clearImages,
    stitchVertical,
    copyStitchedToClipboard,
    runOCR,
    parseDouluoSkillText
  };
})();
