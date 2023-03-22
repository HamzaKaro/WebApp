import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileUpload } from '@app/classes/file-upload';
import {
    DEFAULT_JPEG_TYPE,
    DEFAULT_PNG_TYPE,
    ERROR_MESSAGE_UPLOAD,
    IMAGE_QUANTITY_ERROR,
    INVALID_FILE_TYPE_ERROR,
    INVALID_PICK,
    LISTE_AVATARS,
    NO_FILE_ERROR,
    PICK_UPLOADED_AVATAR,
} from '@app/constants/avatar-constants';
import { FileUploadService } from '@app/services/file-upload.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-upload-blog-cover-popup',
    templateUrl: './upload-blog-cover-popup.component.html',
    styleUrls: ['./upload-blog-cover-popup.component.scss'],
})
export class UploadBlogCoverPopupComponent {
    fileToUpload: File | null;
    errorMessage: string;
    isProcessing: boolean;
    currentFileUpload: FileUpload;
    percentage: number;
    pictures: string[];
    avatarPickedIndex: number;
    urlAvatarPreview: string;

    fileURL: BehaviorSubject<string>;
    constructor(private dialogRef: MatDialogRef<UploadBlogCoverPopupComponent>, private uploadService: FileUploadService) {
        this.fileToUpload = null;
        this.errorMessage = '';
        this.isProcessing = false;
        this.pictures = LISTE_AVATARS;
        this.fileURL = new BehaviorSubject<string>('');
        this.avatarPickedIndex = INVALID_PICK;
        this.fileURL.subscribe((url: string) => {
            if (url.length !== 0) {
                this.urlAvatarPreview = url;
                this.avatarPickedIndex = PICK_UPLOADED_AVATAR;
            }
        });
    }

    onFileSelected(files: FileList) {
        if (!files.length) return;
        this.resetErrorMessage();
        this.resetFile();
        this.updateErrorMessage(files);
        this.fileToUpload = files.item(0);
    }
    getFilename(): string | undefined {
        if (!this.fileToUpload) return undefined;
        return this.fileToUpload.name;
    }

    pickAvatar(index: number) {
        this.avatarPickedIndex = index;
        this.urlAvatarPreview = this.pictures[index];
    }

    isSelected(index: number) {
        return this.avatarPickedIndex === index;
    }

    isTypeOfFileToUploadValid(): boolean {
        return this.fileToUpload !== null && this.isFileTypeValid(this.fileToUpload);
    }

    upload(): void {
        if (this.fileToUpload == null) return;
        const file = this.fileToUpload;
        this.currentFileUpload = new FileUpload(file);
        this.uploadService.pushFileToStorage(this.currentFileUpload, this.fileURL).subscribe(
            (percentage) => {
                this.percentage = Math.round(percentage);
            },
            () => {
                this.errorMessage = ERROR_MESSAGE_UPLOAD;
            },
        );
    }

    close(): void {
        if (this.hasSelected() && this.urlAvatarPreview !== undefined) this.dialogRef.close(this.urlAvatarPreview);
    }

    hasSelected(): boolean {
        return this.avatarPickedIndex !== INVALID_PICK;
    }

    private updateErrorMessage(files: FileList | null) {
        if (files === null || files.length === 0) {
            this.errorMessage = NO_FILE_ERROR;
            return;
        }
        if (files.length > 1) {
            this.errorMessage = IMAGE_QUANTITY_ERROR;
            return;
        }
        if (!this.isFileTypeValid(files.item(0) as File)) {
            this.errorMessage = INVALID_FILE_TYPE_ERROR;
            return;
        }
        this.resetErrorMessage();
    }
    private resetErrorMessage() {
        this.errorMessage = '';
    }

    private resetFile() {
        this.fileToUpload = null;
    }

    private isFileTypeValid(file: File): boolean {
        return file.type === DEFAULT_JPEG_TYPE || file.type === DEFAULT_PNG_TYPE;
    }
}
