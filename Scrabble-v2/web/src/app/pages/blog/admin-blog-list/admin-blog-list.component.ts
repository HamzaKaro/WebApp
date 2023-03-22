import { Component, OnInit } from '@angular/core';
import { BlogPost, BlogService } from './../../../blog.service';

@Component({
    selector: 'app-admin-blog-list',
    templateUrl: './admin-blog-list.component.html',
    styleUrls: ['./admin-blog-list.component.scss'],
})
export class AdminBlogListComponent implements OnInit {
    posts: BlogPost[] = [];
    redirectPath = '/admin/blog/edit/';

    constructor(private blogService: BlogService) {}

    ngOnInit(): void {
        this.getPosts();
    }

    getPosts() {
        return this.blogService.getPostsAsAdmin().subscribe((posts) => {
            this.posts = posts;
        });
    }
}
