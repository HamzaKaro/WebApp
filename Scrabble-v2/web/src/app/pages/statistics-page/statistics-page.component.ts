import { Component, OnInit } from '@angular/core';
import { ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { HttpUserDataService } from '@app/http-user-data.service';
import { PlayerGameReport } from '@app/interfaces/player-game-report';
import { UserStatistics } from '@app/interfaces/user-statistics';
import { PseudoService } from '@app/pseudo.service';

@Component({
    selector: 'app-statistics-page',
    templateUrl: './statistics-page.component.html',
    styleUrls: ['./statistics-page.component.scss'],
})
export class StatisticsPageComponent implements OnInit {
    statistics: UserStatistics;
    gamesPlayed: PlayerGameReport[];
    constructor(private loggedUser: PseudoService, private http: HttpUserDataService) {
        this.statistics = { nGamesPlayed: 0, nGamesWon: 0, averageGamePoints: 0, averageGameDuration: 0 };
        this.gamesPlayed = [];
    }

    async ngOnInit() {
        const gamesPlayed = await this.http.getGamesStatistics(this.loggedUser.email).toPromise();
        if (this.http.anErrorOccurred()) {
            // TODO (david) mettre un petit message d'erreur ou un truc dans le genre
            // this.showErrorDialog();
            return;
        }
        this.gamesPlayed = gamesPlayed;
        this.statistics = this.createStatistics();
    }

    createStatistics(): UserStatistics {
        if (!this.gamesPlayed.length) {
            return {
                nGamesPlayed: 0,
                nGamesWon: 0,
                averageGamePoints: 0,
                averageGameDuration: 0,
            };
        }
        let averageDuration = 0;
        let averageScore = 0;
        let gamesWon = 0;
        this.gamesPlayed.forEach((game: PlayerGameReport) => {
            averageScore += game.score;
            averageDuration += game.gameDuration;
            if (game.endType.toLowerCase() === 'v') {
                gamesWon += 1;
            }
        });

        averageScore /= this.gamesPlayed.length;
        averageDuration /= this.gamesPlayed.length;
        return {
            nGamesPlayed: this.gamesPlayed.length,
            nGamesWon: gamesWon,
            averageGamePoints: Math.round(averageScore),
            averageGameDuration: Math.round(averageDuration),
        };
    }
    handleDuration(duration: number): string {
        return `${Math.round(duration / (ONE_MINUTE_IN_SECONDS * ONE_SECOND_IN_MS))} min`;
    }
}
