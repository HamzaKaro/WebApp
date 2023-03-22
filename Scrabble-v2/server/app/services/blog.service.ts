import { collection, CollectionReference, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore/lite';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { Firebase } from './firebase.service';

interface CreatePostDto {
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    cover: string;
    content: { en: string; fr: string };
    publishedAt: number;
    status: 'published' | 'draft' | 'archived';
    author: string;
}
interface Post {
    id: string;
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    cover: string;
    content: { en: string; fr: string };
    updatedAt: number;
    createdAt: number;
    publishedAt: number;
    status: 'published' | 'draft' | 'archived';
}

@Service()
export class BlogService {
    postsRef: CollectionReference;

    constructor(private firebase: Firebase) {
        this.postsRef = collection(this.firebase.dbStore(), 'posts');
    }

    async getPublishedPosts(): Promise<Post[]> {
        const posts = await getDocs(this.postsRef);
        if (posts.empty) {
            return [];
        }
        const data = posts.docs
            .map((post) => post.data())
            .filter((p) => p.status === 'published')
            .sort((a, b) => b.publishedAt - a.publishedAt) as Post[];
        return data;
    }

    async getPostsAsAdmin(): Promise<Post[]> {
        const posts = await getDocs(this.postsRef);
        if (posts.empty) {
            return [];
        }
        const data = posts.docs.map((post) => post.data()).sort((a, b) => b.updatedAt - a.updatedAt) as Post[];
        return data;
    }

    async getAllPosts(): Promise<Post[]> {
        const posts = await getDocs(this.postsRef);
        if (posts.empty) {
            return [];
        }
        return posts.docs.map((post) => post.data()) as Post[];
    }

    async getPostById(id: string): Promise<Post> {
        const postDoc = doc(this.postsRef, id);
        const post = (await getDoc(postDoc)).data() as Post;
        return post;
    }

    async createPost(createPostDto: CreatePostDto): Promise<Post> {
        const postToCreate: Post = {
            ...createPostDto,
            id: uuidv4(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            publishedAt: createPostDto.publishedAt || Date.now(),
        };
        const postDoc = doc(this.postsRef, postToCreate.id);

        return await setDoc(postDoc, postToCreate).then(() => {
            return postToCreate;
        });
    }

    async updatePost(id: string, updatedPost: Post): Promise<Post> {
        const postDocRef = doc(this.postsRef, id);
        const document = await getDoc(postDocRef);
        if (!document.exists()) throw new Error('Post not found');
        const post = document.data() as Post;
        const postToUpdate: Post = {
            ...post,
            ...updatedPost,
            updatedAt: Date.now(),
        };

        const postDoc = doc(this.postsRef, id);
        return await setDoc(postDoc, postToUpdate).then(() => {
            return postToUpdate;
        });
    }

    async deletePost(id: string): Promise<boolean> {
        if (!id) return false;
        const postDocRef = doc(this.postsRef, id);
        const document = await getDoc(postDocRef);
        if (!document.exists()) return false;
        deleteDoc(postDocRef);
        return true;
    }
}
