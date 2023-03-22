import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPost, BlogService } from '@app/blog.service';

@Component({
    selector: 'app-blog-post',
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss'],
})
export class BlogPostComponent implements OnInit {
    post: BlogPost;
    constructor(public router: Router, private route: ActivatedRoute, private blogService: BlogService) {}

    ngOnInit() {
        this.blogService.getPostById(this.route.snapshot.params.id).subscribe((post) => {
            this.post = post;
        });
    }
}
