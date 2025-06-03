import { GoogleAuthManager } from './googleAuth';
import { BACKUP_CONFIG } from '../../config/googleConfig';

// Helper to sanitize sensitive data
const sanitizeData = (data) => {
  const sanitized = { ...data };
  
  // Remove sensitive fields from users
  if (Array.isArray(sanitized.users)) {
    sanitized.users = sanitized.users.map(user => {
      const { password, token, emailVerificationToken, ...cleanUser } = user;
      return cleanUser;
    });
  }

  return sanitized;
};

export async function createBackup(data, onProgress) {
  try {
    onProgress?.({ status: 'Authenticating...', progress: 0 });
    const token = await GoogleAuthManager.getValidToken();
    if (!token) {
      throw new Error('Not authenticated with Google Drive');
    }
    
    onProgress?.({ status: 'Creating backup folder...', progress: 20 });
    const folderId = await getOrCreateFolder(token);
    
    onProgress?.({ status: 'Preparing backup data...', progress: 40 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const sanitizedData = sanitizeData(data);
    
    onProgress?.({ status: 'Uploading backup...', progress: 60 });
    const file = await uploadFile(token, folderId, backupFileName, sanitizedData);
    
    onProgress?.({ status: 'Validating backup...', progress: 80 });
    
    onProgress?.({ status: 'Backup complete!', progress: 100 });
    return file;
  } catch (error) {
    console.error('Backup failed:', error);
    onProgress?.({ status: `Error: ${error.message}`, progress: 0 });
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

export async function getOrCreateFolder(token) {
  try {
    const folderResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name="${BACKUP_CONFIG.folderName}"+and+mimeType="application/vnd.google-apps.folder"`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (!folderResponse.ok) {
      throw new Error('Failed to search for backup folder');
    }
    
    const folderData = await folderResponse.json();
    
    if (folderData.files && folderData.files.length > 0) {
      return folderData.files[0].id;
    }
    
    // Create folder if it doesn't exist
    const createFolderResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: BACKUP_CONFIG.folderName,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      }
    );
    
    if (!createFolderResponse.ok) {
      throw new Error('Failed to create backup folder');
    }
    
    const newFolder = await createFolderResponse.json();
    if (!newFolder.id) {
      throw new Error('Invalid folder creation response');
    }
    
    return newFolder.id;
  } catch (error) {
    throw new Error(`Failed to get or create folder: ${error.message}`);
  }
}

export async function uploadFile(token, folderId, fileName, data) {
  try {
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json',
      description: BACKUP_CONFIG.description,
    };
    
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    
    // Add validation info to backup data
    const backupData = {
      ...data,
      _meta: {
        version: BACKUP_CONFIG.version,
        timestamp: new Date().toISOString(),
        type: 'inventory_backup'
      }
    };
    
    form.append(
      'file',
      new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    );
    
    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,description',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload backup file');
    }
    
    const response = await uploadResponse.json();
    if (!response.id) {
      throw new Error('Invalid upload response');
    }
    
    return response;
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

export async function listBackups(token) {
  try {
    const folderId = await getOrCreateFolder(token);
    
    const listResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/json'&orderBy=createdTime desc&fields=files(id,name,createdTime,description)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (!listResponse.ok) {
      throw new Error('Failed to list backup files');
    }
    
    const { files } = await listResponse.json();
    return files?.filter(file => 
      file.description?.includes(BACKUP_CONFIG.description)
    ) || [];
  } catch (error) {
    const backupData = await response.json();
    
    // Validate backup data
    if (!backupData._meta?.type === 'inventory_backup') {
      throw new Error('Invalid backup file format');
    }
    
    // Remove metadata before returning
    const { _meta, ...data } = backupData;
    return data;
  } catch (error) {
    throw new Error(`Failed to download backup: ${error.message}`);
  }
}