import { Injectable, inject, NgZone } from '@angular/core';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { firebase } from '@core/config/firebase.config';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

/**
 * Service de gestion du Firebase Storage
 * Gère l'upload et la suppression des fichiers (avatars, documents, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private zone = inject(NgZone);

  /**
   * Upload un fichier dans Firebase Storage avec suivi de progression
   * @param file - Le fichier à uploader
   * @param path - Le chemin de stockage (ex: 'avatars/userId')
   * @param onProgress - Callback appelé avec le % de progression
   * @returns La download URL publique
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(firebase.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) {
            this.zone.run(() => onProgress(progress));
          }
        },
        (error) => {
          console.error('Erreur upload Firebase Storage:', error);
          reject(new Error(this.getStorageErrorMessage(error.code)));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  /**
   * Upload l'avatar d'un utilisateur
   * @param file - L'image à uploader
   * @param userId - L'ID de l'utilisateur
   * @param onProgress - Callback de progression
   * @returns La download URL de l'avatar
   */
  async uploadAvatar(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Valider le fichier
    this.validateImageFile(file);

    // Générer un nom unique avec timestamp pour éviter le cache
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatar_${Date.now()}.${extension}`;
    const path = `avatars/${userId}/${fileName}`;

    return this.uploadFile(file, path, onProgress);
  }

  /**
   * Supprimer un fichier depuis son URL Firebase Storage
   * @param downloadURL - L'URL de téléchargement du fichier
   */
  async deleteFileByURL(downloadURL: string): Promise<void> {
    try {
      // Extraire le path depuis l'URL Firebase Storage
      const storageRef = ref(firebase.storage, downloadURL);
      await deleteObject(storageRef);
    } catch (error: any) {
      // Ignorer les erreurs si le fichier n'existe pas
      if (error.code !== 'storage/object-not-found') {
        console.warn('Impossible de supprimer l\'ancien avatar:', error);
      }
    }
  }

  /**
   * Valider qu'un fichier est une image et respecte la taille max
   */
  private validateImageFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
    }

    if (file.size > maxSizeBytes) {
      throw new Error('La taille du fichier dépasse la limite de 5 MB.');
    }
  }

  /**
   * Messages d'erreur Firebase Storage lisibles
   */
  private getStorageErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'storage/unauthorized': 'Accès non autorisé au stockage.',
      'storage/canceled': 'Upload annulé.',
      'storage/quota-exceeded': 'Quota de stockage dépassé.',
      'storage/invalid-checksum': 'Fichier corrompu, veuillez réessayer.',
      'storage/retry-limit-exceeded': 'Délai d\'attente dépassé, veuillez réessayer.',
      'storage/invalid-format': 'Format de fichier invalide.',
    };
    return messages[code] || 'Erreur lors de l\'upload du fichier.';
  }
}
