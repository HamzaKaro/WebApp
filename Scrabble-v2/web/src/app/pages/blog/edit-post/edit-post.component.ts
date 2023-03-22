import { TranslateService } from '@ngx-translate/core';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPost, BlogService } from '@app/blog.service';
import { UploadBlogCoverPopupComponent } from '@app/components/upload-blog-cover-popup/upload-blog-cover-popup.component';
import { POPUP_HEIGHT, POPUP_WIDTH, SUCCESSFUL_UPLOAD_MESSAGE } from '@app/constants/avatar-constants';
import { SNACKBAR_DURATION_IN_MS } from '@app/constants/constants';

@Component({
    selector: 'app-edit-post',
    templateUrl: './edit-post.component.html',
    styleUrls: ['./edit-post.component.scss'],
})
export class EditPostComponent implements OnInit {
    form: FormGroup;
    formdata: FormGroup;
    successMessage: string;
    errorMessage: string;
    confirmation: string;
    urlCover: string;
    post: BlogPost;
    // TODO: Display a message and don't show the form if post is not found
    constructor(
        private fb: FormBuilder,
        private blogService: BlogService,
        private dialog: MatDialog,
        public router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private translateService: TranslateService,
    ) {}

    ngOnInit() {
        this.formdata = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(1)]],
            description: ['', [Validators.required, Validators.minLength(1)]],
            content: ['', [Validators.required, Validators.minLength(1)]],
            status: ['', [Validators.required, Validators.minLength(1)]],
            cover: ['', [Validators.required]],
        });
        this.blogService.getPostById(this.route.snapshot.params.id).subscribe((post) => {
            this.post = post;
            this.formdata = this.fb.group({
                title: [post.title, [Validators.required, Validators.minLength(1)]],
                description: [post.description, [Validators.required, Validators.minLength(1)]],
                content: [post.content, [Validators.required, Validators.minLength(1)]],
                status: [post.status, [Validators.required, Validators.minLength(1)]],
                cover: [post.cover, [Validators.required]],
            });
            this.urlCover = post.cover;
        });
    }

    onSave() {
        if (this.formdata.valid) {
            this.blogService.updatePost(this.post.id, this.formdata.value).subscribe(() => {
                this.translateService.get('blog.post_updated_successfully').subscribe((res: string) => {
                    this.snackBar.open(res || 'Post updated successfully', 'X', {
                        duration: SNACKBAR_DURATION_IN_MS,
                    });
                });
            });
        }
    }

    openUploadCoverPopup() {
        const dialog = this.dialog.open(UploadBlogCoverPopupComponent, {
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            autoFocus: true,
            data: [],
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            this.successMessage = SUCCESSFUL_UPLOAD_MESSAGE;
            this.urlCover = result;
            this.formdata.patchValue({ cover: result });
        });
    }

    deletePost() {
        this.blogService.deletePost(this.post.id).subscribe(() => {
            this.router.navigate(['admin']);
        });
    }
}
