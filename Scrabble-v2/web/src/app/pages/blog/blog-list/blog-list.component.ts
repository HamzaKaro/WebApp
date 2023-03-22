import { Component, OnInit } from '@angular/core';
import { BlogPost, BlogService } from './../../../blog.service';

@Component({
    selector: 'app-blog-list',
    templateUrl: './blog-list.component.html',
    styleUrls: ['./blog-list.component.scss'],
})
export class BlogListComponent implements OnInit {
    posts: BlogPost[] = [];
    constructor(private blogService: BlogService) {}

    ngOnInit(): void {
        this.getPosts();
    }

    getPosts() {
        return this.blogService.getPublishedPosts().subscribe((posts) => {
            this.posts = posts;
        });
    }
}
