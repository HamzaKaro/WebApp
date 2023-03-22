import { Application } from '@app/app';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { DatabaseService } from './services/database.service';
import { Firebase } from './services/firebase.service';
import { GamesHistoryService } from './services/games.history.service';
import { SocketManager } from './services/socket-manager.service';
import { UserService } from './services/user.service';
@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- from Nikolay Radoev
    private static readonly baseTen: number = 10;
    socketManager: SocketManager;
    private server: http.Server;

    constructor(
        private readonly application: Application,
        private databaseService: DatabaseService,
        private firebase: Firebase,
        private gamesHistoryService: GamesHistoryService,
        private userService: UserService,
    ) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseTen) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init() {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);
        await this.connectToDatabase();
        this.socketManager = new SocketManager(this.server, this.gamesHistoryService, this.firebase, this.userService);
        this.socketManager.handleSockets();

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
    }

    private onError(error: NodeJS.ErrnoException) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening() {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }

    private async connectToDatabase() {
        try {
            await this.databaseService.start();
            // eslint-disable-next-line no-console -- useful to track the dataBase state
            console.log('Database connection successful !');
        } catch {
            // eslint-disable-next-line no-console -- useful to track the dataBase state
            console.error('Database connection failed !');
            process.exit(1);
        }
    }
}
