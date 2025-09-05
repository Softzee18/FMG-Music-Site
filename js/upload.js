const supabaseUrl = 'https://xbesxrkwxsejryazwpzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZXN4cmt3eHNlanJ5YXp3cHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjAzOTYsImV4cCI6MjA2MjgzNjM5Nn0.j4phHvtmTmuqVSg691_Mlsr-7nMNmqhZtjNoaNOp0TQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


//Upload modal logic
document.addEventListener('DOMContentLoaded', function() {
  const uploadBtn = document.getElementById('upload-btn');
  const uploadModal = document.getElementById('upload-modal');
  const closeModal = document.querySelector('.close-modal');

  if (uploadBtn && uploadModal) {
    uploadBtn.addEventListener('click', () => {
      uploadModal.style.display = 'block';
    });
  }
  if (closeModal && uploadModal) {
    closeModal.addEventListener('click', () => {
      uploadModal.style.display = 'none';
    });
  }
  window.addEventListener('click', (e) => {
    if (e.target === uploadModal) {
      uploadModal.style.display = 'none';
    }
  });
  // // Close modal on escape key
  // window.addEventListener('keydown', (e) => {
  //   if (e.key === 'Escape' && uploadModal.style.display === 'block') {
  //     uploadModal.style.display = 'none';
  //   }
  // });
  // // Close modal on outside click
  // window.addEventListener('click', (e) => {
  //   if (e.target === uploadModal) {
  //     uploadModal.style.display = 'none';
  //   }
  // });

  
  // Upload form logic
  const uploadForm = document.getElementById('upload-form');
  const feedback = document.getElementById('upload-feedback');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Get form values
      const type = document.getElementById('content-type').value;
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const coverInput = document.getElementById('cover-upload');
      const coverFile = coverInput ? coverInput.files[0] : null;
      const mediaInput = document.getElementById('media-upload');
      const file = mediaInput ? mediaInput.files[0] : null;

      if (!file) {
        feedback.textContent = 'Please select an audio or video file.';
        feedback.style.color = 'red';
        return;
      }

      // Upload media file to Supabase Storage
      const filePath = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) {
        feedback.textContent = 'Upload failed: ' + error.message;
        feedback.style.color = 'red';
        return;
      }

      // (Optional) Upload cover image if provided
      let coverPath = null;
      if (coverFile) {
        coverPath = `${Date.now()}_${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('uploads')
          .upload(coverPath, coverFile);
        if (coverError) {
          feedback.textContent = 'Cover upload failed: ' + coverError.message;
          feedback.style.color = 'orange';
          // Continue anyway
        }
      }

      // Save metadata to Supabase Database with user id
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      const user_id = user ? user.id : null;

      const { error: dbError } = await supabase.from('uploads').insert([
        { type, title, description, file_path: filePath, cover_path: coverPath, user_id }
      ]);
      if (dbError) {
        feedback.textContent = 'File uploaded, but failed to save metadata.';
        feedback.style.color = 'orange';
        return;
      }

      feedback.textContent = 'Upload successful!';
      feedback.style.color = 'green';
      uploadForm.reset();
      displayUploads();
    });
  }

  // Display uploads for the current user
  async function displayUploads() {
    const uploadsList = document.getElementById('uploads-list');
    uploadsList.innerHTML = 'Loading...';

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      uploadsList.innerHTML = 'Please log in to see your uploads.';
      return;
    }

    // Fetch uploads for the current user
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      uploadsList.innerHTML = 'Failed to load uploads.';
      return;
    }

    if (!data.length) {
      uploadsList.innerHTML = 'No uploads yet.';
      return;
    }

    uploadsList.innerHTML = data.map(item => {
      const { publicURL } = supabase.storage.from('uploads').getPublicUrl(item.file_path);
      let preview = '';
      if (item.type === 'music' || item.type === 'beat') {
        preview = `<audio controls src="${publicURL}"></audio>`;
      } else if (item.type === 'video') {
        preview = `<video controls width="220" src="${publicURL}"></video>`;
      }
      // Show cover image if available
      let coverImg = '';
      if (item.cover_path) {
        const { publicURL: coverURL } = supabase.storage.from('uploads').getPublicUrl(item.cover_path);
        coverImg = `<img src="${coverURL}" alt="Cover" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px 8px 0 0;">`;
      }
      return `
        <div class="upload-card" data-id="${item.id}" data-file-path="${item.file_path}">
          ${coverImg}
          <h4>${item.title}</h4>
          <p>${item.description || ''}</p>
          ${preview}
          <small>Uploaded: ${new Date(item.created_at).toLocaleString()}</small>
          <button class="edit-upload">Edit</button>
          <button class="delete-upload">Delete</button>
        </div>
      `;
    }).join('');
  }

  displayUploads();

  // Delete and Edit handlers
  document.getElementById('uploads-list').addEventListener('click', async function(e) {
    const card = e.target.closest('.upload-card');
    if (!card) return;
    const id = card.getAttribute('data-id');
    const filePath = card.getAttribute('data-file-path');

    // Delete
    if (e.target.classList.contains('delete-upload')) {
      if (confirm('Delete this upload?')) {
        await supabase.from('uploads').delete().eq('id', id);
        await supabase.storage.from('uploads').remove([filePath]);
        card.remove();
      }
    }

    // Edit
    if (e.target.classList.contains('edit-upload')) {
      const newTitle = prompt('New title:', card.querySelector('h4').textContent);
      const newDesc = prompt('New description:', card.querySelector('p').textContent);
      if (newTitle !== null) {
        await supabase.from('uploads').update({ title: newTitle, description: newDesc }).eq('id', id);
        card.querySelector('h4').textContent = newTitle;
        card.querySelector('p').textContent = newDesc;
      }
    }
  });

  // Drag-and-drop support for media-upload
  const fileUpload = document.getElementById('media-upload');
  if (fileUpload) {
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = '<p>Drag and drop files here</p>';
    fileUpload.parentNode.insertBefore(dropZone, fileUpload.nextSibling);

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileUpload.files = files;
        const event = new Event('change');
        fileUpload.dispatchEvent(event);
      }
    });
  }
});