const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractPublicIdFromUrl(url) {
  // Split the URL by "/"
  const parts = url.split('/');

  // The public ID is the last part after the version number
  const lastPart = parts[parts.length - 1];

  // Remove the file extension (e.g., ".jpg")
  const publicId = lastPart.split('.')[0];

  return publicId;
}

const uploadonCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;
    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: 'auto',
    });
    // console.log(`File is uploaded on Cloudinary`, response.url);
    // console.log(response);
    fs.unlinkSync(localpath);
    return response;
  } catch (err) {
    fs.unlinkSync(localpath);
    //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deletefromCloudinary = async (imageUrl) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    console.log(imageUrl);
    console.log(publicId);
    // If the public ID is invalid, return early
    if (!publicId) {
      console.log('Invalid image URL. Cannot extract public ID.');
      return;
    }

    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    if (result.result === 'ok') {
      console.log(`Image deleted successfully from Cloudinary: ${publicId}`);
    } else {
      console.log(`Failed to delete image from Cloudinary: ${publicId}`);
    }
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
  }
};

module.exports = { uploadonCloudinary, deletefromCloudinary };
