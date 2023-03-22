import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BlogService } from './../services/blog.service';

@Service()
export class BlogController {
    router: Router;

    constructor(private blogService: BlogService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.get('/', async (_req: Request, res: Response) => {
            try {
                const posts = await this.blogService.getPublishedPosts();
                res.json(posts);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send([]);
            }
        });

        this.router.get('/admin', async (_req: Request, res: Response) => {
            try {
                const posts = await this.blogService.getPostsAsAdmin();
                res.json(posts);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send([]);
            }
        });

        this.router.get('/:id', async (_req: Request, res: Response) => {
            try {
                const post = await this.blogService.getPostById(_req.params.id);
                res.json(post);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send();
            }
        });
        this.router.post('/', async (_req: Request, res: Response) => {
            try {
                const post = await this.blogService.createPost(_req.body);
                res.json(post);
            } catch (error) {
                console.error(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
            }
        });

        this.router.patch('/:id', async (_req: Request, res: Response) => {
            try {
                const post = await this.blogService.updatePost(_req.params.id, _req.body);
                res.json(post);
            } catch (error) {
                console.error(error);

                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
            }
        });
        this.router.delete('/:id', async (_req: Request, res: Response) => {
            try {
                const success = await this.blogService.deletePost(_req.params.id);
                res.json(success);
            } catch (error) {
                console.error(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
            }
        });
    }
}
