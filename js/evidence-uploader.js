/**
 * Level3Support - Client-Side Image Compression & Upload Utility (v5.5.6)
 * Option 1 Canvas Compression down to 50-100KB for offline PWA storage.
 */
(function() {
    function compressImage(file, maxDimension = 1024, quality = 0.6, tag = '') {
        return new Promise((resolve, reject) => {
            // Check if file is actually an image
            if (!file.type.startsWith('image/')) {
                reject(new Error('Selected file is not an image.'));
                return;
            }

            // Adjust compression settings for high-detail evidence types
            if (tag === 'Nameplate' || tag === 'Serial Number' || tag === 'Defect' || tag === 'Electrical Defect') {
                maxDimension = 2048;
                quality = 0.85;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Maintain Aspect Ratio, Scale to Max Dimension
                    if (width > height) {
                        if (width > maxDimension) {
                            height = Math.round(height * (maxDimension / width));
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width = Math.round(width * (maxDimension / height));
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Export as JPEG with chosen quality compression
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    console.log(`[Compression] Resized from ${img.width}x${img.height} to ${width}x${height}. File size reduced.`);
                    resolve(compressedDataUrl);
                };
                img.onerror = (err) => reject(new Error('Failed to load image element: ' + err.message));
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(new Error('FileReader error: ' + err.message));
            reader.readAsDataURL(file);
        });
    }

    window.L3Evidence = {
        compressImage
    };
})();
