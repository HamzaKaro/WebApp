import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface BlogPost {
    id: string;
    title: string;
    description: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    status: string;
    author: string;
    cover: string;
    slug: string;
}
@Injectable({
    providedIn: 'root',
})
export class BlogService {
    baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = environment.serverUrl;
    }

    getPublishedPosts() {
        return this.http.get<BlogPost[]>(`${this.baseUrl}/blog`);
    }

    getPostsAsAdmin() {
        return this.http.get<BlogPost[]>(`${this.baseUrl}/blog/admin`);
    }

    getPostById(id: string) {
        return this.http.get<BlogPost>(`${this.baseUrl}/blog/${id}`);
    }

    createPost(post: BlogPost) {
        return this.http.post<BlogPost>(`${this.baseUrl}/blog`, post);
    }

    deletePost(id: string) {
        return this.http.delete<boolean>(`${this.baseUrl}/blog/${id}`);
    }

    updatePost(id: string, post: BlogPost) {
        return this.http.patch<BlogPost>(`${this.baseUrl}/blog/${id}`, post);
    }
}
