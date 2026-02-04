// DOM elements
const video = document.getElementById('video');
const snapBtn = document.getElementById('snapBtn');
const preview = document.getElementById('preview');
const previewSection = document.querySelector('.preview-section');
const retakeBtn = document.getElementById('retakeBtn');
const saveBtn = document.getElementById('saveBtn');
const gallery = document.getElementById('gallery');

// Canvas for photo capture
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Access camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
  } catch (err) {
    alert('Error accessing camera: ' + err.message);
  }
}

// Take photo from video
snapBtn.addEventListener('click', () => {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  canvas.width = videoWidth;
  canvas.height = videoHeight;
  ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

  // Draw a fun frame around the photo (optional)
  ctx.strokeStyle = '#e17055';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, videoWidth - 10, videoHeight - 10);

  // Show preview
  preview.src = canvas.toDataURL('image/jpeg');
  previewSection.style.display = 'block';
  video.style.display = 'none';
  snapBtn.style.display = 'none';
});

// Retake photo
retakeBtn.addEventListener('click', () => {
  previewSection.style.display = 'none';
  video.style.display = 'block';
  snapBtn.style.display = 'inline-block';
});

// Save photo to server
saveBtn.addEventListener('click', () => {
  const dataUrl = canvas.toDataURL('image/jpeg');
  const formData = new FormData();
  const blob = dataURLToBlob(dataUrl);
  formData.append('photo', blob, 'photo.jpg');

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.filename) {
      loadGallery(); // Refresh gallery
      previewSection.style.display = 'none';
      video.style.display = 'block';
      snapBtn.style.display = 'inline-block';
    } else {
      alert('Error saving photo: ' + data.error);
    }
  })
  .catch(err => {
    console.error('Error uploading:', err);
    alert('Upload failed');
  });
});

// Utility: convert data URL to Blob
function dataURLToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Load gallery
function loadGallery() {
  fetch('/api/photos')
  .then(res => res.json())
  .then(data => {
    gallery.innerHTML = '';
    data.images.forEach(filename => {
      const img = document.createElement('img');
      img.src = '/uploads/' + filename;
      img.alt = 'Photo';
      gallery.appendChild(img);
    });
  })
  .catch(err => {
    console.error('Error loading gallery:', err);
  });
}

// Load gallery on page load
loadGallery();

// Start camera on page load
window.addEventListener('load', startCamera);
