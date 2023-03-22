import { PseudoService } from '@app/pseudo.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BlogService } from '@app/blog.service';
import { UploadBlogCoverPopupComponent } from '@app/components/upload-blog-cover-popup/upload-blog-cover-popup.component';
import { POPUP_HEIGHT, POPUP_WIDTH, SUCCESSFUL_UPLOAD_MESSAGE } from '@app/constants/avatar-constants';
import { SNACKBAR_DURATION_IN_MS } from '@app/constants/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-create-post',
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
    currentLang: 'fr' | 'en' = 'fr';
    form: FormGroup;
    formdata: FormGroup;
    successMessage: string;
    errorMessage: string;
    confirmation: string;
    urlCover: string = '';

    constructor(
        private fb: FormBuilder,
        private blogService: BlogService,
        private dialog: MatDialog,
        public router: Router,
        private snackBar: MatSnackBar,
        private translateService: TranslateService,
        private pseudoService: PseudoService,
    ) {}

    ngOnInit() {
        this.formdata = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(1)]],
            description: ['', [Validators.required, Validators.minLength(1)]],
            content: ['', [Validators.required, Validators.minLength(1)]],
            isPublished: [true, [Validators.required]],
            status: ['published', [Validators.required]],
            cover: [''],
            author: [this.pseudoService.pseudo || ''],
        });
    }

    init(editor: any): void {
        editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
    }

    changeLang(lang: 'fr' | 'en') {
        this.currentLang = lang;
    }

    onCreatePost() {
        if (this.formdata.valid) {
            this.blogService.createPost(this.formdata.value).subscribe((post) => {
                if (post) {
                    this.translateService.get('blog.post_created_successfully').subscribe((res: string) => {
                        this.snackBar.open(res || 'Post created successfully', 'X', {
                            duration: SNACKBAR_DURATION_IN_MS,
                        });
                    });
                    this.router.navigate([`/admin/blog/edit/${post.id}`]);
                    this.confirmation = 'Post created successfully';
                } else {
                    this.snackBar.open('An Error occured while creating post', 'X', {
                        duration: SNACKBAR_DURATION_IN_MS,
                    });
                }
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
}
